use chrono::NaiveDateTime;
use serde::ser::SerializeMap;
use serde::{Serialize, Serializer};
use serde_json::Value;
use sqlx::mysql::MySqlRow;
use sqlx::{Column, Row, TypeInfo, ValueRef};

pub struct MySqlRowWrapper(pub MySqlRow);

impl Serialize for MySqlRowWrapper {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let row = &self.0;
        let columns = row.columns();
        let mut map = serializer.serialize_map(Some(columns.len()))?;
        for column in columns {
            let column_name = column.name();
            let type_info = column.type_info();
            let column_value: Value = match type_info.name() {
                // Handle NULL values
                _ if row.try_get_raw(column_name).unwrap().is_null() => Value::Null,
                // Assume text-like (string/JSON-like) fields
                "VARCHAR" | "TEXT" | "CHAR" | "JSON" => row.get::<String, &str>(column_name).into(),
                // Numeric values
                "INT" | "INTEGER" => row.get::<i32, &str>(column_name).into(),
                "BIGINT" => row.get::<i64, &str>(column_name).into(),
                "FLOAT" | "DOUBLE" => row.get::<f64, &str>(column_name).into(),
                // Handle DATETIME and TIMESTAMP
                "DATETIME" | "TIMESTAMP" => {
                    let naive_date_time: NaiveDateTime = row.get(column_name);
                    Value::String(naive_date_time.to_string())
                }
                // Fallback: Serialize everything else as a string
                _ => row.get::<String, &str>(column_name).into(),
            };
            map.serialize_entry(column_name, &column_value)?;
        }

        map.end()
    }
}
