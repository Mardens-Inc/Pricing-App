use anyhow::Result;
use calamine::{open_workbook, Reader, Xlsx};
use std::path::Path;

pub fn get_sheets(path: &Path) -> Result<Vec<String>> {
    let workbook: Xlsx<_> = open_workbook(path)?;
    Ok(workbook.sheet_names())
}

pub fn get_column_headers(path: &Path, sheet_name: &str) -> Result<Vec<String>> {
    let mut workbook: Xlsx<_> = open_workbook(path)?;
    let range = workbook.worksheet_range(sheet_name)?;
    Ok(range.headers().unwrap_or(vec![]))
}
