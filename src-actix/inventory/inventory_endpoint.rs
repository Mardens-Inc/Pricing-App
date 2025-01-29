use crate::data_database_connection::DatabaseConnectionData;
use crate::http_error::Result;
use crate::inventory_db;
use crate::inventory_db::export_csv;
use actix_web::{get, head, options, post, web, HttpResponse, Responder};
use crypto::hashids::decode_single;
use serde_json::json;
use std::collections::HashMap;
use std::ops::Deref;
use std::sync::Arc;

#[get("/")]
pub async fn get_inventory(
    id: web::Path<String>,
    query: web::Query<inventory_db::InventoryFilterOptions>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let data = data.as_ref();
    let data = data.deref();
    let id = decode_single(id.as_ref())?;
    let query = query.0;

    let results = inventory_db::get_inventory(id, Some(query), data).await?;
    Ok(HttpResponse::Ok().json(results))
}

#[head("/")]
pub async fn get_inventory_headers(
    _id: web::Path<String>,
    _data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    Ok(HttpResponse::InternalServerError().json(json!({
        "error": "Not implemented"
    })))
}

#[options("/")]
pub async fn get_inventory_options(
    _id: web::Path<String>,
    _data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    Ok(HttpResponse::InternalServerError().json(json!({
        "error": "Not implemented"
    })))
}

#[post("/")]
pub async fn insert_record(
    _id: web::Path<String>,
    _body: web::Json<Vec<serde_json::Value>>,
    _data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    Ok(HttpResponse::InternalServerError().json(json!({
        "error": "Not implemented"
    })))
}

#[post("/upload")]
pub async fn upload_inventory(
    _body: web::Bytes,
    _data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    Ok(HttpResponse::InternalServerError().json(json!({
        "error": "Not implemented"
    })))
}

#[get("/download")]
pub async fn download_inventory(
    query: web::Query<HashMap<String, String>>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let data = data.as_ref();
    let data = data.deref();
    let id = query.get("id").unwrap();
    let id = id.deref();
    let id = decode_single(id)?;
    let csv = export_csv(id, data).await?;
    Ok(HttpResponse::Ok()
        .content_type("text/csv")
        .insert_header((
            "content-disposition",
            format!("attachment; filename={}.csv", id),
        ))
        .body(csv))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/inventory/{id}")
            .service(get_inventory)
            .service(get_inventory_headers)
            .service(get_inventory_options)
            .service(insert_record)
            .service(upload_inventory)
            .service(download_inventory)
            .default_service(web::to(|| async {
                // Handle unmatched API endpoints
                HttpResponse::NotFound().json(json!({"error": "API endpoint not found"}))
            })),
    );
}
