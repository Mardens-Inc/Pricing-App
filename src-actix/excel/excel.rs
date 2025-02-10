use anyhow::{anyhow, Result};
use calamine::{open_workbook, DataType, Reader, Xlsx};
use serde_derive::Serialize;
use std::path::PathBuf;

#[derive(Serialize, Debug)]
pub struct DuplicateRowResponse {
    pub count: usize,
    pub rows: Vec<Vec<String>>,
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
    columns: Vec<String>,
) -> Result<DuplicateRowResponse> {
    if !path.exists() {
        return Err(anyhow!(
            "Spreadsheet file with identifier {:?} was not found.",
            path
        ));
    }
    let mut workbook: Xlsx<_> = open_workbook(path)?;
    let range = workbook.worksheet_range(sheet_name)?;
    let headers = range
        .rows()
        .next()
        .ok_or_else(|| anyhow!("Sheet is empty or does not contain headers"))?;

    let column_indices: Vec<usize> = columns
        .iter()
        .filter_map(|col_name| {
            headers
                .iter()
                .position(|header| header.get_string() == Some(col_name))
        })
        .collect();

    if column_indices.is_empty() {
        return Err(anyhow!(
            "None of the specified columns were found in the sheet headers"
        ));
    }

    let mut rows = vec![];
    let mut seen = std::collections::HashSet::new();

    for row in range.rows().skip(1) {
        // Skip headers
        let filtered_row: Vec<String> = column_indices
            .iter()
            .filter_map(|&index| {
                row.get(index)
                    .and_then(|cell| cell.get_string().map(String::from))
            })
            .collect();

        if !filtered_row.is_empty() && !seen.insert(filtered_row.clone()) {
            rows.push(filtered_row);
        }
    }

    Ok(DuplicateRowResponse {
        count: rows.len(),
        rows,
    })
}
