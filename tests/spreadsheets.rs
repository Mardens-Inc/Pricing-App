#[cfg(test)]
mod tests {
    use actix_web::{test, web, App};
    use log::*;
    use pricing_app_lib::constants::initialize_asset_directories;
    use pricing_app_lib::spreadsheet_endpoint::configure;
    use serde_json::Value;
    use std::str::from_utf8;

    #[actix_web::test]
    async fn prepare_excel_sheet() {
        // Set the logging level and initialize the logger
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();
        // Initialize the test service
        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // Read the test file
        let file = std::fs::read("tests/assets/spreadsheets.xlsx")
            .expect("Unable to read spreadsheet file");

        // Create test request
        let req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "application/vnd.ms-excel"))
            .to_request();

        // Execute request and verify response
        let resp = test::call_service(&app, req).await;
        debug!("Prepare response: {:#?}", resp);
        assert_eq!(resp.status(), 200);
    }

    #[actix_web::test]
    async fn prepare_csv_sheet() {
        // Set the logging level and initialize the logger
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();
        // Initialize the test service
        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // Read the test file
        let file = std::fs::read("tests/assets/spreadsheets.csv").expect("Unable to read CSV file");

        // Create test request
        let req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "text/csv"))
            .to_request();

        // Execute request and verify response
        let resp = test::call_service(&app, req).await;
        debug!("Prepare response: {:#?}", resp);
        assert_eq!(resp.status(), 200);
    }

    #[actix_web::test]
    async fn test_get_sheets() {
        // Setup
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();

        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // First upload a file to get an identifier
        let file = std::fs::read("tests/assets/spreadsheets.xlsx")
            .expect("Unable to read spreadsheet file");

        let upload_req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "application/vnd.ms-excel"))
            .to_request();

        let upload_resp = test::call_service(&app, upload_req).await;
        debug!("Upload response: {:#?}", upload_resp);
        assert_eq!(upload_resp.status(), 200);

        // Extract identifier from response
        let body: Value = test::read_body_json(upload_resp).await;
        debug!("Body: {:#?}", body);
        let identifier = body["identifier"].as_str().unwrap();

        // Test get_sheets endpoint
        let req = test::TestRequest::get()
            .uri(&format!("/spreadsheet/{}", identifier))
            .to_request();

        let resp = test::call_service(&app, req).await;
        debug!("Get sheets response: {:#?}", resp);
        assert_eq!(resp.status(), 200);

        // Verify response contains sheet names
        let body: Value = test::read_body_json(resp).await;
        debug!("Sheets: {:#?}", body);
        assert!(!body.as_array().unwrap().is_empty());
    }

    #[actix_web::test]
    async fn test_get_column_headers() {
        // Setup
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();

        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // First upload a file to get an identifier
        let file = std::fs::read("tests/assets/spreadsheets.xlsx")
            .expect("Unable to read spreadsheet file");

        let upload_req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "application/vnd.ms-excel"))
            .to_request();

        let upload_resp = test::call_service(&app, upload_req).await;
        debug!("Upload response: {:#?}", upload_resp);
        assert_eq!(upload_resp.status(), 200);

        // Extract identifier from response
        let body: Value = test::read_body_json(upload_resp).await;
        let identifier = body["identifier"].as_str().unwrap();
        debug!("Identifier: {}", identifier);

        // First get sheets to get a valid sheet name
        let sheets_req = test::TestRequest::get()
            .uri(&format!("/spreadsheet/{}", identifier))
            .to_request();

        let sheets_resp = test::call_service(&app, sheets_req).await;
        let sheets: Value = test::read_body_json(sheets_resp).await;
        debug!("Sheets: {:#?}", sheets);
        let sheet_name = sheets[0].as_str().unwrap();

        // Test get_column_headers endpoint
        let req = test::TestRequest::get()
            .uri(&format!(
                "/spreadsheet/{}/{}",
                identifier,
                urlencoding::encode(sheet_name)
            ))
            .to_request();

        let resp = test::call_service(&app, req).await;
        debug!("Get headers response: {:#?}", resp);
        assert_eq!(resp.status(), 200);

        // Verify response contains headers
        let body: Value = test::read_body_json(resp).await;
        debug!("Headers: {:#?}", body);
        assert!(!body.as_array().unwrap().is_empty());
    }

    #[actix_web::test]
    async fn test_find_duplicate_rows() {
        // Setup
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();

        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // First upload a file to get an identifier
        let file = std::fs::read("tests/assets/spreadsheets.xlsx")
            .expect("Unable to read spreadsheet file");

        let upload_req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "application/vnd.ms-excel"))
            .to_request();

        let upload_resp = test::call_service(&app, upload_req).await;
        debug!("Upload response: {:#?}", upload_resp);
        assert_eq!(upload_resp.status(), 200);

        // Extract identifier from response
        let body: Value = test::read_body_json(upload_resp).await;
        let identifier = body["identifier"].as_str().unwrap();

        // Test find_duplicate_rows endpoint
        let req = test::TestRequest::get()
            .uri(&format!(
                "/spreadsheet/{}/2904%20Inventory/duplicates?columns=UPC%20Nbr,Description",
                identifier
            ))
            .to_request();

        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        let body = test::read_body(resp).await.to_vec();
        let body = body.as_slice();
        let body = from_utf8(body).unwrap();
        if status != 200 {
            error!(
                "Find duplicates response failed with status: {} and body: {:?}",
                status, body
            );
        }
        assert_eq!(status, 200);

        // Verify response structure
        let body: Value = serde_json::from_str(body).unwrap();
        debug!("Body: {:#?}", body);
        assert!(body.is_array());
    }
}
