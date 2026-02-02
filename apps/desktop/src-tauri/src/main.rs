mod db;

use tauri::Manager;

#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {name}! (from Tauri)")
}

#[tauri::command]
fn kv_get(db: tauri::State<db::Db>, key: String) -> Result<Option<String>, String> {
    db.kv_get(&key)
}

#[tauri::command]
fn kv_set(db: tauri::State<db::Db>, key: String, value: String) -> Result<(), String> {
    db.kv_set(&key, &value)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let db = db::Db::new(app.handle())?;
            db.migrate()?;
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, kv_get, kv_set])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greet_returns_expected_message() {
        assert_eq!(greet("kumix".into()), "Hello, kumix! (from Tauri)");
    }
}
