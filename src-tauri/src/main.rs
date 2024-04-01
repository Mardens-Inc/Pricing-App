// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use crate::config::init;

mod print_manager;
mod config;
mod update_manager;
mod updater;


fn main() {
    init();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            print_manager::get_printers,
            print_manager::print,
            config::save,
            config::load,
            config::save_default,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}