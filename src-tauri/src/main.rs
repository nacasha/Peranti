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
    let builder = tauri::Builder::default();

    // The window-state plugin is desktop-only; it has no mobile implementation.
    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());

    builder
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            my_custom_command,
            reveal_file_manager,
        ])
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use tauri::Manager;
                if let Some(window) = app.get_webview_window("main") {
                    set_macos_window_radius(&window, 12.0);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(target_os = "macos")]
fn set_macos_window_radius(window: &tauri::WebviewWindow, radius: f64) {
    use objc::{class, msg_send, sel, sel_impl};

    if let Ok(ns_window) = window.ns_window() {
        unsafe {
            let ns_window = ns_window as *mut objc::runtime::Object;

            // Make the NSWindow itself transparent so the corners don't show a background
            let clear: *mut objc::runtime::Object = msg_send![class!(NSColor), clearColor];
            let _: () = msg_send![ns_window, setBackgroundColor: clear];
            let _: () = msg_send![ns_window, setOpaque: false];

            // Round the content view layer
            let content_view: *mut objc::runtime::Object = msg_send![ns_window, contentView];
            let _: () = msg_send![content_view, setWantsLayer: true];
            let layer: *mut objc::runtime::Object = msg_send![content_view, layer];
            let _: () = msg_send![layer, setCornerRadius: radius];
            let _: () = msg_send![layer, setMasksToBounds: true];

            // Recompute the shadow so it follows the rounded shape
            let _: () = msg_send![ns_window, invalidateShadow];
        }
    }
}
