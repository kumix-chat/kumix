use rusqlite::Connection;

type Migration = (u32, &'static str);

const MIGRATIONS: &[Migration] = &[(
    1,
    r#"
CREATE TABLE IF NOT EXISTS kv(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
"#,
)];

pub fn run(connection: &mut Connection) -> rusqlite::Result<()> {
    connection.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY)",
        [],
    )?;

    let current_version: u32 = connection
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    for (version, sql) in MIGRATIONS {
        if *version <= current_version {
            continue;
        }

        apply_migration(connection, *version, sql)?;
    }

    Ok(())
}

fn apply_migration(connection: &mut Connection, version: u32, sql: &str) -> rusqlite::Result<()> {
    let transaction = connection.transaction()?;
    transaction.execute_batch(sql)?;
    transaction.execute(
        "INSERT INTO schema_migrations(version) VALUES (?1)",
        [version],
    )?;
    transaction.commit()?;
    Ok(())
}
