//use crate::{get_sql_credentials, DEV};
//use crypto::hashids::encode;
//use serde::{Deserialize, Serialize};
//use sqlx::{AnyPool, FromRow};
//use std::error::Error;
//
//#[derive(Serialize, Deserialize, FromRow)]
//pub struct Location {
//	pub id: i32,
//	pub name: String,
//	pub location: String,
//	pub po: String,
//	pub image: String,
//	pub options: serde_json::Value,
//	pub post_date: sqlx::types::chrono::NaiveDateTime,
//}
//
//#[derive(Serialize, Deserialize, FromRow)]
//pub struct HashedLocation {
//	pub id: String,
//	pub name: String,
//	pub location: String,
//	pub po: String,
//	pub image: String,
//	pub options: serde_json::Value,
//	pub post_date: sqlx::types::chrono::NaiveDateTime,
//}
//
//trait Hash {
//	fn hash(&self) -> HashedLocation;
//}
//
//impl Hash for Location {
//	fn hash(&self) -> HashedLocation {
//		HashedLocation {
//			id: encode(&[self.id as u64]),
//			name: self.name.clone(),
//			location: self.location.clone(),
//			po: self.po.clone(),
//			image: self.image.clone(),
//			options: self.options.clone(),
//			post_date: self.post_date.clone(),
//		}
//	}
//}
//
//
//pub async fn initialize_database() -> Result<(), Box<dyn Error>> {
//	let pool = create_connection().await?;
//	sqlx::query(
//		"CREATE TABLE IF NOT EXISTS locations (
//			id INTEGER PRIMARY KEY AUTOINCREMENT,
//			name TEXT NOT NULL,
//			location TEXT NOT NULL,
//			po TEXT NOT NULL,
//			image TEXT NOT NULL,
//			options TEXT NOT NULL,
//			post_date TEXT NOT NULL
//		)"
//	)
//		.execute(&pool)
//		.await?;
//	Ok(())
//}
//
////async fn create_connection() -> Result<AnyPool, Box<dyn Error>> {
////	if DEV {
////		sqlx::Connection::connect("sqlite://./pricing.db").await?
////	} else {
////		match get_sql_credentials().await {
////			Ok(credentials) => {
////				sqlx::Connection::connect(format!("mysql://{user}:{password}@{host}/pricing", user = credentials.user, password = credentials.password, host = credentials.host).as_str()).await?
////			},
////			Err(e) => {
////				Err(sqlx::Error::Io(std::io::Error::new(std::io::ErrorKind::Other, e)).into())
////			}
////		}
////	}
////}
//
//pub async fn get() -> Result<Vec<Location>, Box<dyn Error>> {
//	let pool = create_connection()?;
//	let locations = sqlx::query_as::<_, Location>("SELECT * FROM locations")
//		.fetch_all(&pool)
//		.await?;
//	Ok(locations)
//}
//
//pub async fn insert(location: Location) -> Result<(), Box<dyn Error>> {
//	let pool = create_connection()?;
//	sqlx::query(
//		"INSERT INTO locations (name, location, po, image, options, post_date) VALUES (?, ?, ?, ?, ?, ?)"
//	)
//		.bind(location.name)
//		.bind(location.location)
//		.bind(location.po)
//		.bind(location.image)
//		.bind(location.options)
//		.bind(location.post_date)
//		.execute(&pool)
//		.await?;
//	Ok(())
//}
//
//pub async fn delete(id: u64) -> Result<(), Box<dyn Error>> {
//	let pool = create_connection()?;
//	sqlx::query("DELETE FROM locations WHERE id = ?")
//		.bind(id)
//		.execute(&pool)
//		.await?;
//	sqlx::query(format!("DROP TABLE IF EXISTS {}", encode(&[id])).as_str())
//		.execute(&pool)
//		.await?;
//	Ok(())
//}