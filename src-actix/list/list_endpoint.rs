use crate::list_data;
use actix_web::{get, post, Responder};

#[get("")]
pub async fn get_all_locations() -> impl Responder {
	todo!("Get all locations");

	"Get all locations"
}

#[post("")]
pub async fn create_location(body: list_data::LocationListItem) -> impl Responder {
	todo!("Create a location");
	"Get all locations"
}