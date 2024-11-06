use actix_web::{get, Responder};

#[get("/")]
pub async fn get_all_databases()->impl Responder{
	"All databases"
}