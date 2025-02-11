use std::collections::HashSet;
use anyhow::{anyhow, Result};
use calamine::{open_workbook, DataType, Reader, Xlsx};
use serde_derive::Serialize;
use serde_json::{json, Value};
use std::path::PathBuf;

#[derive(Serialize, Debug)]
pub struct DuplicateRowResponse {
    pub count: usize,
    pub row_indexes: Vec<usize>,
    pub rows: Vec<Value>,
}

pub fn get_sheets(path: PathBuf) -> Result<Vec<String>> {
    if !path.exists() {
        return Err(anyhow!(
            "Spreadsheet file with identifier {:?} was not found.",
            path
        ));
    }
    let workbook: Xlsx<_> = open_workbook(path)?;
    Ok(workbook.sheet_names())
}

pub fn get_column_headers(path: PathBuf, sheet_name: &str) -> Result<Vec<String>> {
    if !path.exists() {
        return Err(anyhow!(
            "Spreadsheet file with identifier {:?} was not found.",
            path
        ));
    }
    let mut workbook: Xlsx<_> = open_workbook(path)?;
    let range = workbook.worksheet_range(sheet_name)?;
    Ok(range.headers().unwrap_or(vec![]))
}

pub fn find_duplicate_rows(
    path: PathBuf,
    sheet_name: &str,
    columns: Option<Vec<String>>,
) -> Result<DuplicateRowResponse> {
    if !path.exists() {
        return Err(anyhow!(
            "Spreadsheet file with identifier {:?} was not found.",
            path
        ));
    }
    let mut workbook: Xlsx<_> = open_workbook(path)?;
    let range = workbook.worksheet_range(sheet_name)?;

    // Get header row from the sheet
    let headers = range
        .rows()
        .next()
        .ok_or_else(|| anyhow!("Sheet is empty or does not contain headers"))?;

    // Determine which columns to use based on provided names or use all columns (if none specified)
    let column_indices: Vec<(usize, String)> = if let Some(columns) = columns {
        columns
            .iter()
            .filter_map(|col_name| {
                headers
                    .iter()
                    .position(|header| header.get_string() == Some(col_name))
                    .map(|pos| (pos, col_name.clone()))
            })
            .collect()
    } else {
        headers
            .iter()
            .enumerate()
            .filter_map(|(idx, header)| header.get_string().map(|h| (idx, h.to_string())))
            .collect()
    };

    if column_indices.is_empty() {
        return Err(anyhow!(
            "None of the specified columns were found in the sheet headers"
        ));
    }

    let mut unique_rows = vec![];
    let mut duplicate_indexes = vec![];
    let mut seen = HashSet::new();

    // Enumerate rows, skipping the header (the first row).
    // We use enumerate() to capture the original row index from the sheet.
    for (i, row) in range.rows().skip(1).enumerate() {
        // Compute row number as Excel uses 1-indexing and header is the first row.
        let original_row_index = i + 2;

        // Extract the relevant column values for the current row.
        let row_values: Vec<String> = column_indices
            .iter()
            .filter_map(|(index, _)| {
                row.get(*index)
                   .and_then(|cell| { 
                       cell.as_string().map(String::from) 
                   })
            })
            .collect();

        let row_key = row_values.join(",");

        // If this combination of values has already been seen, record the row index as duplicate.
        if !seen.insert(row_key) {
            duplicate_indexes.push(original_row_index);
        } else {
            // Build an object containing the header-value pairs for the unique row.
            let row_obj: Value = json!(column_indices
                .iter()
                .zip(row_values.iter())
                .map(|((_, header), value)| (header.clone(), Value::String(value.clone())))
                .collect::<serde_json::Map<String, Value>>());
            unique_rows.push(row_obj);
        }
    }

    Ok(DuplicateRowResponse {
        count: duplicate_indexes.len(),
        row_indexes: duplicate_indexes,
        rows: unique_rows,
    })

}
