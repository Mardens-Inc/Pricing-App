use crate::data_database_connection::DatabaseConnectionData;
use crate::{list_data, list_db};
use actix_web::{delete, get, patch, post, web, HttpResponse, Responder};
use crypto::hashids::decode_single;
use serde_json::json;
use std::error::Error;
use std::sync::Arc;

#[get("/")]
pub async fn get_all_locations(
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder, Box<dyn Error>> {
    let data = data.get_ref().as_ref();
    let locations = list_db::get_all(data).await?;
    Ok(HttpResponse::Ok().json(locations))
}

#[get("/{id}")]
pub async fn get_location(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder, Box<dyn Error>> {
    let data = data.get_ref().as_ref();
    let id = id.as_ref();
    let id = decode_single(id)?;
    let location = list_db::single(id, data).await?;

    Ok(HttpResponse::Ok().json(location))
}

#[patch("/{id}")]
pub async fn update_location(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
    body: web::Json<list_data::LocationListItem>,
) -> Result<impl Responder, Box<dyn Error>> {
    let data = data.get_ref().as_ref();
    let id = id.as_ref();
    let id = decode_single(id)?;
    let location = list_db::update(id, &body, data).await?;
    Ok(HttpResponse::Ok().json(location))
}

#[post("/")]
pub async fn create_location(
    data: web::Data<Arc<DatabaseConnectionData>>,
    body: web::Json<list_data::LocationListItem>,
) -> Result<impl Responder, Box<dyn Error>> {
    let data = data.get_ref().as_ref();
    list_db::insert(&body, data).await?;
    Ok(HttpResponse::Ok().finish())
}

#[delete("/{id}")]
pub async fn delete_location(
    data: web::Data<Arc<DatabaseConnectionData>>,
    id: web::Path<String>,
) -> Result<impl Responder, Box<dyn Error>> {
    let data = data.get_ref().as_ref();
    let id = id.as_ref();
    let id = decode_single(id)?;

    // Delete from the locations list
    list_db::delete(id, data).await?;

    // Delete the database table
    // TODO: Implement this

    Ok(HttpResponse::Ok().finish())
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/list")
            .service(get_all_locations)
            .service(get_location)
            .service(update_location)
            .service(create_location)
            .service(delete_location)
            .default_service(web::to(|| async {
                // Handle unmatched API endpoints
                HttpResponse::NotFound().json(json!({"error": "API endpoint not found"}))
            })),
    );
}
