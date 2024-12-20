use crate::data_database_connection::DatabaseConnectionData;
use crate::{list_data, list_db};
use actix_web::{delete, get, post, web, HttpResponse, Responder};
use log::error;
use std::sync::Arc;
use serde_json::json;

#[get("")]
pub async fn get_all_locations(
	data: web::Data<Arc<DatabaseConnectionData>>,
) -> impl Responder {
	let data = data.get_ref().as_ref();
	let locations = match list_db::get_all(data).await {
		Ok(locations) => locations,
		Err(err) => {
			error!("Failed to get locations: {}", err);
			return HttpResponse::InternalServerError().json(json!({
				"error": "Failed to get locations",
				"details": format!("{}", err),
			}));
		}
	};
	HttpResponse::Ok().json(locations)
}

#[post("")]
pub async fn create_location(
	data: web::Data<Arc<DatabaseConnectionData>>,
	body: web::Json<list_data::LocationListItem>
) -> impl Responder {
	let data = data.get_ref().as_ref();
	match list_db::insert(&body, data).await {
		Ok(_) => HttpResponse::Ok().finish(),
		Err(err) => {
			error!("Failed to insert location: {}", err);
			HttpResponse::InternalServerError().finish()
		}
	}
}

#[delete("/{id}")]
pub async fn delete_location(
	data: web::Data<Arc<DatabaseConnectionData>>,
	id: web::Path<u64>,
) -> impl Responder {
	let data = data.get_ref().as_ref();
	let id = *id.as_ref();

	// Delete from the locations list
	match list_db::delete(id, data).await {
		Ok(_) => (),
		Err(err) => {
			error!("Failed to delete location: {}", err);
		}
	};

	// Delete the database table
	// TODO: Implement this

	HttpResponse::Ok().finish()
}