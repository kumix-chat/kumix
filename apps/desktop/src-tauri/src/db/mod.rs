mod migrate;

use std::path::{Path, PathBuf};

use rusqlite::{Connection, OpenFlags, OptionalExtension};
use tauri::Manager;

pub struct Db {
    path: PathBuf,
}

impl Db {
    pub fn new(app: &tauri::AppHandle) -> Result<Self, String> {
        let app_dir = app
            .path()
            .app_data_dir()
            .map_err(|error| format!("failed to resolve app_data_dir: {error}"))?;

        Ok(Self {
            path: app_dir.join("kumix.db"),
        })
    }

    #[cfg(test)]
    pub fn from_path(path: PathBuf) -> Self {
        Self { path }
    }

    pub fn migrate(&self) -> Result<(), String> {
        let mut connection = self.open_connection()?;
        migrate::run(&mut connection).map_err(|error| format!("failed to migrate db: {error}"))?;
        Ok(())
    }

    pub fn kv_get(&self, key: &str) -> Result<Option<String>, String> {
        let mut connection = self.open_connection()?;
        kv_get(&mut connection, key).map_err(|error| format!("failed to kv_get: {error}"))
    }

    pub fn kv_set(&self, key: &str, value: &str) -> Result<(), String> {
        let mut connection = self.open_connection()?;
        kv_set(&mut connection, key, value)
            .map_err(|error| format!("failed to kv_set: {error}"))?;
        Ok(())
    }

    fn open_connection(&self) -> Result<Connection, String> {
        ensure_parent_dir(&self.path)
            .map_err(|error| format!("failed to create db dir: {error}"))?;

        let connection = Connection::open_with_flags(
            &self.path,
            OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE,
        )
        .map_err(|error| format!("failed to open sqlite db: {error}"))?;

        connection
            .pragma_update(None, "foreign_keys", "ON")
            .map_err(|error| format!("failed to set foreign_keys pragma: {error}"))?;
        let _ = connection.pragma_update(None, "journal_mode", "WAL");
        let _ = connection.busy_timeout(std::time::Duration::from_millis(5_000));

        Ok(connection)
    }
}

fn ensure_parent_dir(path: &Path) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    Ok(())
}

fn kv_get(connection: &mut Connection, key: &str) -> rusqlite::Result<Option<String>> {
    let mut statement = connection.prepare("SELECT value FROM kv WHERE key = ?1")?;
    let value = statement
        .query_row([key], |row| row.get::<_, String>(0))
        .optional()?;
    Ok(value)
}

fn kv_set(connection: &mut Connection, key: &str, value: &str) -> rusqlite::Result<()> {
    let updated_at = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    connection.execute(
        "INSERT INTO kv(key, value, updated_at) VALUES (?1, ?2, ?3)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        (key, value, updated_at),
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn kv_roundtrip_works() {
        let dir = tempfile::tempdir().expect("tempdir");
        let db = Db::from_path(dir.path().join("test.db"));
        db.migrate().expect("migrate");

        assert_eq!(db.kv_get("missing").expect("kv_get"), None);

        db.kv_set("k", "v").expect("kv_set");
        assert_eq!(db.kv_get("k").expect("kv_get"), Some("v".into()));

        db.kv_set("k", "v2").expect("kv_set");
        assert_eq!(db.kv_get("k").expect("kv_get"), Some("v2".into()));
    }
}
