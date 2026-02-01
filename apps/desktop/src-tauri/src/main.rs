#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {name}! (from Tauri)")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
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
