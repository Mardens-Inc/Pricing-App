use crate::data_database_connection::DatabaseConnectionData;
use crate::http_error::Result;
use crate::options_data::InventoryOptions;
use actix_web::{get, patch, post, web, HttpResponse, Responder};
use crypto::hashids::decode;
use log::debug;
use serde_json::json;
use std::sync::Arc;

/// Get options
#[get("/")]
pub async fn get_options(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let database_id = id.into_inner();
    let database_id = decode(database_id.as_str())?;
    let database_id = database_id
        .first()
        .ok_or_else(|| anyhow::anyhow!("Invalid ID"))?;
    let connection_data = data.get_ref();

    debug!("Fetching options for database_id: {}", database_id);

    if let Some(options) = InventoryOptions::get(connection_data, *database_id).await? {
        Ok(HttpResponse::Ok().json(options))
    } else {
        Ok(HttpResponse::NotFound().json(json!({ "error": "No options found" })))
    }
}

/// Create (insert) new options
#[post("/")]
pub async fn create_options(
    id: web::Path<String>,
    options: web::Json<InventoryOptions>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let database_id = id.into_inner();
    let database_id = decode(database_id.as_str())?;
    let database_id = database_id
        .first()
        .ok_or_else(|| anyhow::anyhow!("Invalid ID"))?;
    let connection_data = data.get_ref();
    let options = options.into_inner();

    debug!("Inserting new options for database_id: {}", database_id);
    options.insert(connection_data, *database_id).await?;

    Ok(HttpResponse::Created().json(json!({ "success": true })))
}

/// Update existing options
#[patch("/")]
pub async fn update_options(
    id: web::Path<String>,
    options_update: web::Json<InventoryOptions>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let database_id = id.into_inner();
    let database_id = decode(database_id.as_str())?;
    let database_id = database_id
        .first()
        .ok_or_else(|| anyhow::anyhow!("Invalid ID"))?;
    let connection_data = data.get_ref();
    let options = options_update.into_inner();

    debug!("Updating options for database_id: {}", database_id);

    options.update(connection_data, *database_id).await?;

    Ok(HttpResponse::Ok().finish())
}

/// Delete options
#[actix_web::delete("/")]
pub async fn delete_options(
    id: web::Path<String>,
    data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
    let database_id = id.into_inner();
    let database_id = decode(database_id.as_str())?;
    let database_id = database_id
        .first()
        .ok_or_else(|| anyhow::anyhow!("Invalid ID"))?;
    let connection_data = data.get_ref();

    debug!("Deleting options for database_id: {}", database_id);

    InventoryOptions::delete(connection_data, *database_id).await?;

    Ok(HttpResponse::NoContent().finish())
}

/// Configure endpoints
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/inventory/{id}/options")
            .service(get_options)
            .service(create_options)
            .service(update_options)
            .service(delete_options),
    );
}
