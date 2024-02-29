#[tauri::command]
pub fn save(config: Configuration) {
    let config_file = std::fs::File::create("config.json");
    if let Ok(config_file) = config_file {
        serde_json::to_writer(config_file, &config).unwrap();
        println!("Saved config");
    } else {
        println!("Failed to save config");
    }
}

#[tauri::command]
pub fn load() -> Configuration {
    let config_file = std::fs::File::open("config.json");
    if let Ok(config_file) = config_file {
        let config = serde_json::from_reader(config_file);
        if let Ok(config) = config {

            return config;
        }
    }
    Configuration {
        selected_printer: "".to_string(),
    }
}

#[tauri::command]
pub fn save_default() {
    let config = Configuration {
        selected_printer: "".to_string(),
    };
    save(config)
}

pub fn init() {
    println!("Initializing config");
    println!("Config Path: {:?}", std::path::Path::new("config.json"));
    if !std::path::Path::new("config.json").exists() {
        save_default();
    }
}


#[derive(serde::Deserialize, serde::Serialize)]
pub struct Configuration {
    pub selected_printer: String,
}
