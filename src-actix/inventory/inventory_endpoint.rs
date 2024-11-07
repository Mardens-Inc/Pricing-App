use crate::data_database_connection::DatabaseConnectionData;
use actix_web::{get, head, options, post, web, HttpResponse, Responder};
use serde_json::json;

#[get("")]
pub async fn get_inventory(
	id: web::Path<String>,
	data: web::Data<std::sync::Arc<DatabaseConnectionData>>,
) -> impl Responder {
	HttpResponse::InternalServerError().json(json!({
		"error": "Not implemented"
	}))
}

#[head("")]
pub async fn get_inventory_headers(
	id: web::Path<String>,
	data: web::Data<std::sync::Arc<DatabaseConnectionData>>,
) -> impl Responder {
	HttpResponse::InternalServerError().json(json!({
		"error": "Not implemented"
	}))
}

#[options("")]
pub async fn get_inventory_options(
	id: web::Path<String>,
	data: web::Data<std::sync::Arc<DatabaseConnectionData>>,
) -> impl Responder {
	HttpResponse::InternalServerError().json(json!({
		"error": "Not implemented"
	}))
}

#[post("")]
pub async fn insert_record(
	id: web::Path<String>,
	body: web::Json<Vec<serde_json::Value>>,
	data: web::Data<std::sync::Arc<DatabaseConnectionData>>,
) -> impl Responder {
	HttpResponse::InternalServerError().json(json!({
		"error": "Not implemented"
	}))
}

#[post("/upload")]
pub async fn upload_inventory(
	body: web::Bytes,
	data: web::Data<std::sync::Arc<DatabaseConnectionData>>,
) -> impl Responder {
	HttpResponse::InternalServerError().json(json!({
		"error": "Not implemented"
	}))
}