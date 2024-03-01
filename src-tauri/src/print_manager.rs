extern crate winapi;

use std::ffi::OsStr;
use std::iter::once;
use std::os::windows::ffi::OsStrExt;
use std::ptr::null_mut;

use printers;
use winapi::shared::minwindef::{BOOL, DWORD};
use winapi::shared::ntdef::{HANDLE, LPWSTR};
use winapi::shared::winerror::SUCCEEDED;
use winapi::um::winspool::*;

#[tauri::command]
pub fn print(printer: &str, content: &str) {
    let status = printers::print(printer, content.as_bytes(), None);
    if let Ok(status) = status {
        println!("Print status: {:?}", status);
    } else {
        println!("Print error: {:?}", status);
    }
}


fn to_lpwstr(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(once(0)).collect()
}

unsafe fn print_text(printer_name: &str, doc_name: &str, text: &str) -> Result<(), &'static str> {
    let printer_name = to_lpwstr(printer_name);
    let mut hprinter: HANDLE = null_mut();

    // Opens a connection to the printer and gets the printers handle
    if OpenPrinterW(printer_name.as_ptr() as LPWSTR, &mut hprinter, null_mut()) != BOOL::from(SUCCEEDED(0)) {
        return Err("Could not open printer");
    }

    let doc_info_1 = DOC_INFO_1W {
        pDocName: to_lpwstr(doc_name).as_ptr() as LPWSTR,
        pOutputFile: null_mut(),
        pDatatype: to_lpwstr("TEXT").as_ptr() as LPWSTR,
    };

    // Starts a print job and returns the job id
    let dw_job_id: DWORD = StartDocPrinterW(hprinter, 1 as DWORD, &doc_info_1 as *const _ as _);
    if dw_job_id == 0 {
        return Err("Failed to start print job");
    }

    if StartPagePrinter(hprinter) == 0 {
        return Err("Failed to start page");
    }

    let buffer: &[u8] = text.as_bytes();
    let mut dw_written: DWORD = 0;
    let result = WritePrinter(hprinter, buffer.as_ptr() as _, buffer.len() as _, &mut dw_written) != 0;

    if !result || dw_written as usize != buffer.len() {
        return Err("Failed to write to printer");
    }

    if EndPagePrinter(hprinter) == 0 {
        return Err("Failed to end page");
    }

    if EndDocPrinter(hprinter) == 0 {
        return Err("Failed to end print job");
    }

    if ClosePrinter(hprinter) == 0 {
        return Err("Failed to close printer");
    }

    Ok(())
}


#[tauri::command]
pub fn get_printers() -> Vec<String> {
    let mut results: Vec<String> = Vec::new();

    let p = printers::get_printers().clone();

    for printer in p {
        results.push(printer.name);
    }

    results
}