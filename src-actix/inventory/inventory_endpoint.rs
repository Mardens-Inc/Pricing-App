use crate::data_database_connection::DatabaseConnectionData;
use crate::inventory_db::export_csv;
use actix_web::{get, head, options, post, web, HttpResponse, Responder};
use serde_json::json;
use std::collections::HashMap;
use std::ops::Deref;
use std::sync::Arc;

#[get("")]
pub async fn get_inventory(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> impl Responder {
    HttpResponse::InternalServerError().json(json!({
        "error": "Not implemented"
    }))
}

#[head("")]
pub async fn get_inventory_headers(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> impl Responder {
    HttpResponse::InternalServerError().json(json!({
        "error": "Not implemented"
    }))
}

#[options("")]
pub async fn get_inventory_options(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> impl Responder {
    HttpResponse::InternalServerError().json(json!({
        "error": "Not implemented"
    }))
}

#[post("")]
pub async fn insert_record(
    id: web::Path<String>,
    body: web::Json<Vec<serde_json::Value>>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> impl Responder {
    HttpResponse::InternalServerError().json(json!({
        "error": "Not implemented"
    }))
}

#[post("/upload")]
pub async fn upload_inventory(
    body: web::Bytes,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> impl Responder {
    HttpResponse::InternalServerError().json(json!({
        "error": "Not implemented"
    }))
}

#[get("/download")]
pub async fn download_inventory(
    query: web::Query<HashMap<String, String>>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder, Box<dyn std::error::Error>> {
    let id = query.get("id").unwrap();
    let data = data.as_ref();
    let data = data.deref();
    let csv = export_csv(id.as_str(), data).await?;
    Ok(HttpResponse::Ok()
        .content_type("text/csv")
        .insert_header((
            "content-disposition",
            format!("attachment; filename={}.csv", id),
        ))
        .body(csv))
}
