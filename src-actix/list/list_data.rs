use actix_web::FromRequest;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct LocationListItem {
	pub id: u32,
	pub name: String,
	pub location: String,
	pub po: String,
	pub image: String,
	pub post_date: sqlx::types::chrono::NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LocationListItemNoId {
	pub name: String,
	pub location: String,
	pub po: String,
	pub image: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HashedLocationListItem {
	pub id: String,
	pub name: String,
	pub location: String,
	pub po: String,
	pub image: String,
	pub post_date: sqlx::types::chrono::NaiveDateTime,
}

impl FromRequest for LocationListItem {
	type Error = actix_web::Error;
	type Future = futures::future::Ready<Result<Self, Self::Error>>;
	fn from_request(
		req: &actix_web::HttpRequest,
		_payload: &mut actix_web::dev::Payload,
	) -> Self::Future {
		futures::future::ready(
			serde_urlencoded::from_str::<Self>(req.query_string())
				.map_err(|err| actix_web::error::ErrorBadRequest(err.to_string())),
		)
	}
}

impl FromRequest for LocationListItemNoId {
	type Error = actix_web::Error;
	type Future = futures::future::Ready<Result<Self, Self::Error>>;
	fn from_request(
		req: &actix_web::HttpRequest,
		_payload: &mut actix_web::dev::Payload,
	) -> Self::Future {
		futures::future::ready(
			serde_urlencoded::from_str::<Self>(req.query_string())
				.map_err(|err| actix_web::error::ErrorBadRequest(err.to_string())),
		)
	}
}

