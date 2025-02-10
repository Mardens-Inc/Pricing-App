use crate::constants::UPLOAD_FOLDER;
use crate::http_error::Result;
use actix_web::{post, web, HttpRequest, HttpResponse, Responder};
use log::*;
use serde_json::json;
use std::io::Write;
use std::path::Path;

#[post("/prepare")]
pub async fn upload_sheet(data: web::Bytes, http_request: HttpRequest) -> Result<impl Responder> {
    let content_type = http_request
        .headers()
        .get("content-type")
        .ok_or_else(|| anyhow::anyhow!("Content type not found"))?;
    let content_type = content_type.to_str()?;
    if matches!(content_type, "application/vnd.ms-excel" | "text/csv") {
        info!(
            "Preparing {} File.",
            if content_type == "application/vnd.ms-excel" {
                "Excel"
            } else {
                "CSV"
            }
        );
        let identifier = uuid::Uuid::new_v4().to_string();
        let path = Path::new(UPLOAD_FOLDER).join(&identifier);
        std::fs::File::create(path)?.write_all(&data)?;
        Ok(HttpResponse::Ok().json(json!({
            "identifier": identifier,
            "message": "Spreadsheet file was successfully prepared."
        })))
    } else {
        error!("Unknown file type was provided when preparing the spreadsheet.");
        Ok(HttpResponse::BadRequest().json(json!({"error": "Unknown file type"})))
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/spreadsheet")
            .service(upload_sheet)
            .default_service(web::to(|| async {
                // Handle unmatched API endpoints
                HttpResponse::NotFound().json(json!({"error": "API endpoint not found"}))
            })),
    );
}
