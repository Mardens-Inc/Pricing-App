use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

use tauri::command;

#[tauri::command]
pub fn get_current_version() -> String {
    return env!("CARGO_PKG_VERSION").to_string();
}

async fn get_versions() -> Vec<String> {
    let url = "https://pricing-new.mardens.com/api/clients/versions";
    if let Ok(body) = reqwest::get(url).await.unwrap().text().await {
        let versions = serde_json::from_str::<Vec<String>>(&body).unwrap();
        return versions;
    }
    return Vec::new();
}

async fn check_version_for_updates() -> bool {
    println!("Checking for updates");
    let current_version = env!("CARGO_PKG_VERSION");
    let versions = get_versions().await;
    if let Some(latest_version) = versions.last() {
        return latest_version != current_version;
    }
    return false;
}

#[tauri::command]
pub async fn download_update() -> bool {
    if !check_version_for_updates().await {
        return false;
    }
    println!("Update found!");

    if !download_updater().await {
        return false;
    }

    // build download url
    println!("Downloading update...");
    let url = "https://pricing-new.mardens.com/api/clients/latest";
    if let Ok(response) = reqwest::get(url).await {
        let mut file = std::fs::File::create("tmp.exe").unwrap();
        let content = response.bytes().await.unwrap();
        file.write_all(&content).unwrap();
        println!("Finished downloading update!");
        return true;
    }

    return false;
}

async fn download_updater() -> bool {
    println!("Downloading updater...");
    let url = "https://pricing-new.mardens.com/api/clients/updater";
    if let Ok(response) = reqwest::get(url).await {
        let mut file = std::fs::File::create("updater.exe").unwrap();
        if let Ok(content) = response.bytes().await {
            file.write_all(&content).unwrap();
            println!("Finished downloading updater!");
            return true;
        }
    }
    return false;
}

#[command]
pub fn install_update() -> bool {
    if PathBuf::from("updater.exe").exists() && PathBuf::from("tmp.exe").exists() {
        return Command::new("updater.exe")
            .args(&["tmp.exe", "pricing-app.exe"])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .is_ok();
    }
    return false;
}
