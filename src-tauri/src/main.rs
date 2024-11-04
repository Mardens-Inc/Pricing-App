// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::updater::install_update;

// mod print_manager;
// mod config;
mod options_utility;
mod update_manager;
mod updater;

fn main() {
    if install_update() {
        return;
    }
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // print_manager::get_printers,
            // print_manager::print,
            // config::save,
            // config::load,
            // config::save_default,
            options_utility::map_columns,
            updater::download_update,
            updater::get_current_version,
            updater::install_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
