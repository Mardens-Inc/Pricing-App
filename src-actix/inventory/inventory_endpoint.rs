use crate::inventory_db;
use crate::inventory_db::{export_csv, update_record};
use actix_web::{get, head, options, patch, post, web, HttpResponse, Responder};
use crypto::hashids::decode_single;
use database_common_lib::database_connection::DatabaseConnectionData;
use database_common_lib::http_error::Result;
use serde_json::json;
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
    id: web::Path<String>,
    body: web::Json<Vec<serde_json::Value>>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let data = data.as_ref();
    let data = data.deref();
    let id = decode_single(id.as_ref())?;

    let mut inserted_ids = Vec::new();

    // Process each record in the body
    for record in body.into_inner() {
        let record_id = inventory_db::add_record(id, &record, data).await?;
        inserted_ids.push(record_id);
    }

    Ok(HttpResponse::Created().json(json!({
        "success": true,
        "ids": inserted_ids
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
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let data = data.as_ref();
    let data = data.deref();
    let id = id.as_ref();
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

#[get("/{record}")]
pub async fn get_record(
    path: web::Path<(String, u64)>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let (id, record) = path.into_inner();
    let id = decode_single(&id)?;
    let data = data.as_ref();
    let data = data.deref();
    let record = inventory_db::get_record(id, record, data).await?;
    Ok(HttpResponse::Ok().json(record))
}

#[patch("/{record}")]
pub async fn edit_record(
    path: web::Path<(String, u64)>,
    body: web::Json<serde_json::Value>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let (id, record) = path.into_inner();
    let id = decode_single(&id)?;
    let data = data.as_ref();
    let data = data.deref();
    let body = body.0;
    update_record(id, record, &body, data).await?;
    Ok(HttpResponse::Ok())
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
            .service(edit_record)
            .service(get_record)
            .default_service(web::to(|| async {
                // Handle unmatched API endpoints
                HttpResponse::NotFound().json(json!({"error": "API endpoint not found"}))
            })),
    );
}
