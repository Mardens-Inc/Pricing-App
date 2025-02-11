use crate::constants::UPLOAD_FOLDER;
use crate::http_error::Result;
use actix_web::{get, post, web, HttpRequest, HttpResponse, Responder};
use anyhow::anyhow;
use log::*;
use serde_derive::Deserialize;
use serde_json::json;
use serde_with::serde_as;
use serde_with::{formats::CommaSeparator, StringWithSeparator};
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

#[get("/{identifier}")]
pub async fn get_sheets(identifier: web::Path<String>) -> Result<impl Responder> {
    let identifier = identifier.into_inner();
    let path = Path::new(UPLOAD_FOLDER).join(&identifier);
    let sheets = crate::excel::get_sheets(path)?;
    Ok(HttpResponse::Ok().json(json!(sheets)))
}

#[get("/{identifier}/{sheet_name}")]
pub async fn get_column_headers(
    path_params: web::Path<(String, String)>,
) -> Result<impl Responder> {
    let (identifier, sheet_name) = path_params.into_inner();
    let path = Path::new(UPLOAD_FOLDER).join(&identifier);
    let headers = crate::excel::get_column_headers(path, &sheet_name)?;
    Ok(HttpResponse::Ok().json(json!(headers)))
}

#[serde_as]
#[derive(Deserialize)]
struct FindDuplicateRowsQuery {
    #[serde_as(as = "Option<StringWithSeparator::<CommaSeparator, String>>")]
    columns: Option<Vec<String>>,
}

#[get("/{identifier}/{sheet_name}/duplicates")]
pub async fn find_duplicate_rows(
    path_params: web::Path<(String, String)>,
    columns: web::Query<FindDuplicateRowsQuery>,
) -> Result<impl Responder> {
    let (identifier, sheet_name) = path_params.into_inner();
    let columns = columns.into_inner().columns;
    let path = Path::new(UPLOAD_FOLDER).join(&identifier);
    let duplicates =
        crate::excel::find_duplicate_rows(path, &sheet_name, columns).map_err(|e| {
            error!("Error finding duplicate rows: {}", e);
            anyhow!("Error finding duplicate rows: {}", e)
        })?;
    Ok(HttpResponse::Ok().json(json!(duplicates)))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/spreadsheet")
            .service(upload_sheet)
            .service(get_column_headers)
            .service(get_sheets)
            .service(find_duplicate_rows)
            .default_service(web::to(|| async {
                // Handle unmatched API endpoints
                HttpResponse::NotFound().json(json!({"error": "API endpoint not found"}))
            })),
    );
}
