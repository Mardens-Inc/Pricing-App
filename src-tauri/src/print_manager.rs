use printers;

#[tauri::command]
pub fn print(printer:&str, content:&str) {
    let status = printers::print(printer, content.as_bytes(), None);
    if let Ok(status) = status {
        println!("Print status: {:?}", status);
    } else {
        println!("Print error: {:?}", status);
    }
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