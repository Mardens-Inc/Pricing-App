use crate::http_error::Result;
use crate::icons_endpoint;
use actix_files::file_extension_to_mime;
use actix_web::{get, web, HttpRequest, HttpResponse, Responder};
use log::error;
use std::ffi::OsStr;
use std::fs::File;
use std::io::Read;
use std::ops::Deref;

static ICONS_DIR: &str = "./icons";

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

    for entry in std::fs::read_dir(ICONS_DIR).map_err(|err| {
        error!("Failed to read directory {}: {:?}", ICONS_DIR, err);
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
    let path = format!("{}/{}", ICONS_DIR, name);
    let path = std::path::Path::new(&path);
    if !path.exists() {
        return Ok(HttpResponse::NotFound().finish());
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

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/icons").service(get_icons).service(get_icon));
}
