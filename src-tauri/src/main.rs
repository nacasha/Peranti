// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use opener::reveal;
use rand::seq::SliceRandom;
use rand::thread_rng;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn reveal_file_manager(path: &str) {
    let _ = reveal(path);
}

#[tauri::command]
fn my_custom_command(word_count: usize) -> String {
    // List of Lorem Ipsum words
    let lorem_ipsum_words = [
        "Lorem",
        "ipsum",
        "dolor",
        "sit",
        "amet",
        "consectetur",
        "adipiscing",
        "elit",
    ];

    // Initialize the random number generator
    let mut rng = thread_rng();

    // Generate Lorem Ipsum words
    let mut result = String::new();
    for _ in 0..word_count {
        let word = lorem_ipsum_words.choose(&mut rng).unwrap();
        result.push_str(word);
        result.push(' '); // Add a space between words
    }

    // Trim the trailing space and return the result
    result.trim().into()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            my_custom_command,
            reveal_file_manager,
        ])
        .plugin(tauri_plugin_clipboard_manager::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
