use std::collections::HashMap;
use std::io::prelude::*;
use std::io::Write;

struct Version {
    version: String,
    changelog: String,
}

async fn get_versions() -> Vec<Version> {
    let url = "https://pricing-new.mardens.com/clients/versions";
    let mut versions = Vec::new();
    if let Ok(body) = reqwest::get(url).await.unwrap().text().await {
        let json = serde_json::from_str::<HashMap<String, String>>(&body).unwrap();
        for (version, changelog) in json.iter() {
            versions.push(Version {
                version: version.to_string(),
                changelog: changelog.to_string(),
            });
        }
    }


    return versions;
}

async fn check_version_for_updates() -> bool {
    let current_version = env!("CARGO_PKG_VERSION");
    let versions = get_versions().await;
    let latest_version = versions.first().unwrap();

    return latest_version.version != current_version;
}

async fn download_update() {
    // get prerequisite data
    let versions = get_versions().await;
    let latest_version = versions.first().unwrap();
    let operating_system = std::env::consts::OS;

    // build download url
    let url = format!("https://pricing-new.mardens.com/clients/update/{}/{}", operating_system, latest_version.version);

    // build download path
    let tmp_dir = std::env::temp_dir().join("mardens_pricing").join("update").join(&latest_version.version);
    let tmp_file = tmp_dir.join("update.zip");
    let tmp_dir = tmp_dir.to_str().unwrap();
    let tmp_file = tmp_file.to_str().unwrap();

    // create directory
    std::fs::create_dir_all(tmp_dir).unwrap();

    // download file
    if let Ok(response) = reqwest::get(&url).await {
        let mut file = std::fs::File::create(tmp_file).unwrap();
        let content = response.bytes().await.unwrap();
        file.write_all(&content).unwrap();

        // unzip file
        let mut archive = zip::ZipArchive::new(std::fs::File::open(tmp_file).unwrap()).unwrap();
        archive.extract(tmp_dir).unwrap();

        // delete zip file
        std::fs::remove_file(tmp_file).unwrap();
    }
}

async fn install_update() {
    let current_exe = std::env::current_exe().unwrap();
    let tmp_dir = std::env::temp_dir().join("mardens_pricing").join("update").join(env!("CARGO_PKG_VERSION"));
    let tmp_exe = tmp_dir.join("Pricing App");

    // copy new exe
    // std::fs::copy(tmp_exe, current_exe).unwrap();
    //
    // // restart app
    // std::process::Command::new(current_exe).spawn().unwrap();
    // std::process::exit(0);
}