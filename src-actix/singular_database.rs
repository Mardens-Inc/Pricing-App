use crate::{get_sql_credentials, DEV};
use crypto::hashids::encode;


async fn create_connection() -> Result<sqlx::Pool<sqlx::Any>, sqlx::Error> {
	if DEV {
		sqlx::Pool::connect("sqlite://./pricing.db")
	} else {
		match get_sql_credentials().await {
			Ok(credentials) => {
				sqlx::Pool::connect(format!("mysql://{user}:{password}@{host}/pricing", user = credentials.user, password = credentials.password, host = credentials.host).as_str())
			},
			Err(e) => {
				Err(sqlx::Error::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))
			}
		}
	}
}

pub async fn get(id: String, limit: u32, offset: u32) -> Result<Vec<serde_json::Value>, sqlx::Error> {
	let pool = create_connection()?;
	let locations = sqlx::query_as::<_, serde_json::Value>(format!("SELECT * FROM {} limit {} offset {}", id, limit, offset).as_str())
		.fetch_all(&pool)
		.await?;
	Ok(locations)
}

pub async fn insert(id: String, row: serde_json::Value) -> Result<Vec<String>, sqlx::Error> {
	let pool = create_connection().await?;
	let mut tx = pool.begin().await?;
	let mut success = 0;
	let mut failure = 0;
	let mut inserted_ids = Vec::new();

	if let Some(array) = row.as_array() {
		for item in array {
			let bindings: Vec<_> = item.as_object().unwrap().values().collect();
			let field_count = bindings.len();
			let mut query = String::from(format!("INSERT INTO `{id}` (", id = id));
			query.push_str(&item.as_object().unwrap().keys().cloned().collect::<Vec<_>>().join(", "));
			query.push_str(") VALUES (");
			query.push_str(&vec!["?"; field_count].join(", "));
			query.push(')');

			let mut q = sqlx::query(&query);
			for value in bindings {
				q = q.bind(value);
			}
			if let Err(e) = q.execute(&mut tx).await {
				failure += 1;
				return Err(e);
			} else {
				success += 1;
				let id: (i64,) = sqlx::query_as("SELECT LAST_INSERT_ID()")
					.fetch_one(&mut tx)
					.await?;
				inserted_ids.push(encode(&[id.0 as u64]));
			}
		}
		tx.commit().await?;
	}

	Ok(inserted_ids)
}

pub async fn delete(id: u64) -> Result<(), sqlx::Error> {
	let pool = create_connection()?;
	sqlx::query("DELETE FROM locations WHERE id = ?")
		.bind(id)
		.execute(&pool)
		.await?;
	sqlx::query(format!("DROP TABLE IF EXISTS {}", encode(&[id])).as_str())
		.execute(&pool)
		.await?;
	Ok(())
}