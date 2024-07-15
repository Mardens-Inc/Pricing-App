use serde_json::{Map, Value};



/// Maps the original column names to the new ones for a given vector of Maps.
///
/// # Arguments
///
/// * `original_columns` - A vector of strings containing the original column names.
/// * `new_columns` - A vector of strings where each string will become the new name for the original column name at the same index.
/// * `items` - A vector of Maps, where each Map represents a row in a table where the column names are keys, and the values are their respective values.
///
/// # Returns
///
/// Returns a Result that can be either:
///
/// * Ok - A vector of Maps with the new column names.
/// * Err - A string detailing what went wrong during the processing. Currently, it returns an error if the number of original and new columns are not the same.
///
/// # Remarks
///
/// The function does not modify the original data. It creates a new vector of Maps.
/// The original column name's value gets replaced by Value::Null if it can't find a match in an item.
///
/// # Example
///
/// ```
/// use std::collections::HashMap as Map;
/// use serde_json::Value;
///
/// let original_columns = vec!["A".to_string(), "B".to_string()];
/// let new_columns = vec!["X".to_string(), "Y".to_string()];
/// let mut items:Vec<Map<String, Value>> = Vec::new();
///
/// let mut row1 = Map::new();
/// row1.insert("A".to_string(), Value::String("a1".to_string()));
/// row1.insert("B".to_string(), Value::String("b1".to_string()));
/// items.push(row1);
///
/// let result = map_columns(original_columns, new_columns, items);
/// ```
#[tauri::command]
pub fn map_columns(original_columns: Vec<String>, new_columns: Vec<String>, items: Vec<Map<String, Value>>) -> Result<Vec<Map<String, Value>>, String> {
    if original_columns.len() != new_columns.len() {
        return Err("Original and new columns must have the same length".to_string());
    }
    let mut results: Vec<Map<String, Value>> = vec![Map::new()];
    for item in items {
        let mut new_item = Map::new();
        for (index, original_column) in original_columns.iter().enumerate() {
            let new_column = &new_columns[index];
            let value = item.get(original_column).unwrap_or(&Value::Null);
            new_item.insert(new_column.to_string(), value.clone());
        }
        results.push(new_item);
    }

    return Ok(results);
}
