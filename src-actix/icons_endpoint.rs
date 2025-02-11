use crate::constants::ICONS_FOLDER;
use crate::http_error::Result;
use actix_files::file_extension_to_mime;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use log::error;
use serde_json::json;
use std::ffi::OsStr;
use std::fs::File;
use std::io::{Read, Write};
use std::ops::Deref;
use std::path::Path;

#[derive(serde::Serialize)]
struct Icon {
    name: String,
    url: String,
}

#[get("")]
pub async fn get_icons(request: HttpRequest) -> Result<impl Responder> {
    let mut icons = Vec::new();
    let connection_info = request.connection_info();
    let connection_info = connection_info.deref();
    let host = connection_info.host();
    let scheme = connection_info.scheme();
    let valid_extensions = ["png", "jpg", "jpeg"];

    for entry in std::fs::read_dir(ICONS_FOLDER).map_err(|err| {
        error!("Failed to read directory {}: {:?}", ICONS_FOLDER, err);
        anyhow::Error::msg(format!("Failed to read directory: {:?}", err))
    })? {
        let entry = match entry {
            Ok(e) => e,
            Err(err) => {
                error!("Failed to read entry in directory: {:?}", err);
                continue;
            }
        };
        let path = entry.path();
        let metadata = match entry.metadata() {
            Ok(m) => m,
            Err(err) => {
                error!("Failed to get metadata for {:?}: {:?}", path, err);
                continue;
            }
        };
        let extension = path
            .extension()
            .unwrap_or(OsStr::new(""))
            .to_str()
            .unwrap_or("");
        if metadata.is_dir() || !valid_extensions.contains(&extension) {
            continue;
        }
        let modified_time: u64 = match metadata.modified() {
            Ok(modified) => match modified.duration_since(std::time::UNIX_EPOCH) {
                Ok(duration) => duration.as_secs(),
                Err(err) => {
                    error!(
                        "Failed to calculate duration since UNIX_EPOCH for {:?}: {:?}",
                        path, err
                    );
                    continue;
                }
            },
            Err(err) => {
                error!("Failed to get modification time for {:?}: {:?}", path, err);
                continue;
            }
        };
        let name = match path.file_name().and_then(|n| n.to_str()) {
            Some(n) => n,
            None => {
                error!("Failed to extract file name for {:?}", path);
                continue;
            }
        };
        let url = format!(
            "{}://{}/api/icons/{}?v={}",
            scheme, host, name, modified_time
        );
        icons.push(Icon {
            name: name.to_string(),
            url: url.to_string(),
        });
    }

    Ok(HttpResponse::Ok().json(icons))
}

#[get("/{name}")]
pub async fn get_icon(path: web::Path<String>) -> Result<impl Responder> {
    let name = path.into_inner();
    let path = Path::new(ICONS_FOLDER).join(name);
    let path = path.as_path();
    if !path.exists() {
        return Ok(HttpResponse::NotFound().json(json!({"error": "Icon not found"})));
    }
    let mut file = File::open(path).map_err(|e| {
        error!("Failed to open file: {:?}", e);
        anyhow::Error::msg(format!("Failed to open file: {:?}", e))
    })?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes).map_err(|e| {
        error!("Failed to read file: {:?}", e);
        anyhow::Error::msg(format!("Failed to read file: {:?}", e))
    })?;
    let content_type = file_extension_to_mime(path.extension().unwrap().to_str().unwrap());

    Ok(HttpResponse::Ok()
        .content_type(content_type.to_string())
        .append_header((
            "content-disposition",
            format!(
                "attachment; filename={}",
                path.file_name().unwrap().to_str().unwrap()
            ),
        ))
        .body(bytes))
}


#[derive(serde::Deserialize)]
struct UploadIconOptions{
    overwrite: Option<bool>,
}

#[post("")]
pub async fn upload_icon(
    body: web::Bytes,
    params: web::Query<UploadIconOptions>,
    request: HttpRequest,
) -> Result<impl Responder> {
    let overwrite = params.overwrite.unwrap_or(false);

    // Try to get the Content-Disposition header and parse it as a valid string.
    let header = request
        .headers()
        .get("content-disposition")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| {
            HttpResponse::BadRequest().json(json!({
                "error": "Content-Disposition header is missing or invalid, this is required to set the file name."
            }))
        })?;

    // Extract the filename from the header.
    let filename = header
        .split(';')
        .find(|s| s.contains("filename"))
        .and_then(|s| s.split('=').nth(1))
        .map(sanitize_filename::sanitize)
        .ok_or_else(|| {
            HttpResponse::BadRequest().json(json!({
                "error": "No valid filename found in Content-Disposition header"
            }))
        })?;

    // Determine the filepath and adjust if file exists and overwrite is not enabled.
    let mut filepath = Path::new(ICONS_FOLDER).join(&filename);
    if filepath.exists() && !overwrite {
        let stem = filepath
            .file_stem()
            .and_then(OsStr::to_str)
            .unwrap_or_default();
        let ext = filepath
            .extension()
            .and_then(OsStr::to_str)
            .unwrap_or_default();
        filepath = Path::new(ICONS_FOLDER).join(format!(
            "{}_{}.{}",
            stem,
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            ext
        ));
    }

    let mut file = File::create(&filepath)?;
    file.write_all(&body)?;
    file.sync_all()?;

    Ok(HttpResponse::Ok().json(json!({
        "message": "Icon uploaded successfully",
        "filename": filename
    })))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/icons")
            .service(get_icons)
            .service(get_icon)
            .service(upload_icon),
    )
    .default_service(web::to(|| async {
        // Handle unmatched API endpoints
        HttpResponse::NotFound().json(json!({"error": "API endpoint not found"}))
    }));
}
