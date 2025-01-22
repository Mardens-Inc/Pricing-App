use crate::http_error::Result;
use crate::data_database_connection::DatabaseConnectionData;
use actix_web::{get, patch, post, web, HttpResponse, Responder};
use log::debug;
use std::sync::Arc;
use crate::options_data::InventoryOptions;

/// Get options
#[get("/")]
pub async fn get_options(
	id: web::Path<u64>,
	data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
	let database_id = id.into_inner();
	let connection_data = data.get_ref();

	debug!("Fetching options for database_id: {}", database_id);

	if let Some(options) = InventoryOptions::get(connection_data, database_id).await? {
		Ok(HttpResponse::Ok().json(options))
	} else {
		Ok(HttpResponse::NotFound().finish())
	}
}

/// Create (insert) new options
#[post("/")]
pub async fn create_options(
	id: web::Path<u64>,
	options: web::Json<InventoryOptions>,
	data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
	let database_id = id.into_inner();
	let connection_data = data.get_ref();
	let options = options.into_inner();

	debug!("Inserting new options for database_id: {}", database_id);

	let new_id = options.insert(connection_data, database_id).await?;

	Ok(HttpResponse::Created().json(new_id))
}

/// Update existing options
#[patch("/")]
pub async fn update_options(
	id: web::Path<u64>,
	options_update: web::Json<InventoryOptions>,
	data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
	let database_id = id.into_inner();
	let connection_data = data.get_ref();
	let options = options_update.into_inner();

	debug!("Updating options for database_id: {}", database_id);

	options.update(connection_data, database_id).await?;

	Ok(HttpResponse::Ok().finish())
}

/// Delete options
#[actix_web::delete("/")]
pub async fn delete_options(
	id: web::Path<u64>,
	data: web::Data<Arc<DatabaseConnectionData>>,
) -> Result<impl Responder> {
	let database_id = id.into_inner();
	let connection_data = data.get_ref();

	debug!("Deleting options for database_id: {}", database_id);

	InventoryOptions::delete(connection_data, database_id).await?;

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