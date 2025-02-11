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
        let file = std::fs::read("../../tests/assets/spreadsheets.xlsx")
            .expect("Unable to read spreadsheet file");

        // Create test request
        let req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "application/vnd.ms-excel"))
            .to_request();

        // Execute request and verify response
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        let body = test::read_body(resp).await.to_vec();
        let body = body.as_slice();
        let body = from_utf8(body).unwrap();
        if status != 200 {
            error!(
                "Prepare excel sheet response failed with status: {} and body: {:?}",
                status, body
            );
        }
        debug!("Prepare excel sheet response body: {}", body);
        assert_eq!(status, 200);
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
        let file =
            std::fs::read("../../tests/assets/spreadsheets.csv").expect("Unable to read CSV file");

        // Create test request
        let req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "text/csv"))
            .to_request();

        // Execute request and verify response
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        let body = test::read_body(resp).await.to_vec();
        let body = body.as_slice();
        let body = from_utf8(body).unwrap();
        if status != 200 {
            error!(
                "Prepare CSV sheet response failed with status: {} and body: {:?}",
                status, body
            );
        }
        debug!("Prepare CSV sheet response body: {}", body);
        assert_eq!(status, 200);
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
        let file = std::fs::read("../../tests/assets/spreadsheets.xlsx")
            .expect("Unable to read spreadsheet file");

        let upload_req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "application/vnd.ms-excel"))
            .to_request();

        let upload_resp = test::call_service(&app, upload_req).await;
        let upload_status = upload_resp.status();
        let upload_body = test::read_body(upload_resp).await.to_vec();
        let upload_body = upload_body.as_slice();
        let upload_body_str = from_utf8(upload_body).unwrap();
        if upload_status != 200 {
            error!(
                "Upload response failed with status: {} and body: {:?}",
                upload_status, upload_body_str
            );
        }
        debug!("Upload response body: {}", upload_body_str);
        assert_eq!(upload_status, 200);

        // Extract identifier from response
        let body: Value = serde_json::from_str(upload_body_str).unwrap();
        let identifier = body["identifier"].as_str().unwrap();
        debug!("Identifier: {}", identifier);

        // Test get_sheets endpoint
        let req = test::TestRequest::get()
            .uri(&format!("/spreadsheet/{}", identifier))
            .to_request();

        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        let body = test::read_body(resp).await.to_vec();
        let body = body.as_slice();
        let body = from_utf8(body).unwrap();
        if status != 200 {
            error!(
                "Get sheets response failed with status: {} and body: {:?}",
                status, body
            );
        }
        debug!("Get sheets response body: {}", body);
        assert_eq!(status, 200);

        // Verify response contains sheet names
        let body: Value = serde_json::from_str(body).unwrap();
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
        let file = std::fs::read("../../tests/assets/spreadsheets.xlsx")
            .expect("Unable to read spreadsheet file");

        let upload_req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "application/vnd.ms-excel"))
            .to_request();

        let upload_resp = test::call_service(&app, upload_req).await;
        let upload_status = upload_resp.status();
        let upload_body = test::read_body(upload_resp).await.to_vec();
        let upload_body = upload_body.as_slice();
        let upload_body_str = from_utf8(upload_body).unwrap();
        if upload_status != 200 {
            error!(
                "Upload response failed with status: {} and body: {:?}",
                upload_status, upload_body_str
            );
        }
        debug!("Upload response body: {}", upload_body_str);
        assert_eq!(upload_status, 200);

        // Extract identifier from response
        let body: Value = serde_json::from_str(upload_body_str).unwrap();
        let identifier = body["identifier"].as_str().unwrap();
        debug!("Identifier: {}", identifier);

        // First get sheets to get a valid sheet name
        let sheets_req = test::TestRequest::get()
            .uri(&format!("/spreadsheet/{}", identifier))
            .to_request();

        let sheets_resp = test::call_service(&app, sheets_req).await;
        let sheets_status = sheets_resp.status();
        let sheets_body = test::read_body(sheets_resp).await.to_vec();
        let sheets_body = sheets_body.as_slice();
        let sheets_body_str = from_utf8(sheets_body).unwrap();
        if sheets_status != 200 {
            error!(
                "Sheets response failed with status: {} and body: {:?}",
                sheets_status, sheets_body_str
            );
        }
        debug!("Sheets response body: {}", sheets_body_str);
        assert_eq!(sheets_status, 200);

        let sheets: Value = serde_json::from_str(sheets_body_str).unwrap();
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
        let status = resp.status();
        let body = test::read_body(resp).await.to_vec();
        let body = body.as_slice();
        let body = from_utf8(body).unwrap();
        if status != 200 {
            error!(
                "Get column headers response failed with status: {} and body: {:?}",
                status, body
            );
        }
        debug!("Get column headers response body: {}", body);
        assert_eq!(status, 200);

        // Verify response contains headers
        let body: Value = serde_json::from_str(body).unwrap();
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
        let file = std::fs::read("../../tests/assets/spreadsheets.xlsx")
            .expect("Unable to read spreadsheet file");

        let upload_req = test::TestRequest::post()
            .uri("/spreadsheet/prepare")
            .set_payload(file)
            .insert_header(("content-type", "application/vnd.ms-excel"))
            .to_request();

        let upload_resp = test::call_service(&app, upload_req).await;
        let upload_status = upload_resp.status();
        let upload_body = test::read_body(upload_resp).await.to_vec();
        let upload_body = upload_body.as_slice();
        let upload_body_str = from_utf8(upload_body).unwrap();
        if upload_status != 200 {
            error!(
                "Upload response failed with status: {} and body: {:?}",
                upload_status, upload_body_str
            );
        }
        debug!("Upload response body: {}", upload_body_str);
        assert_eq!(upload_status, 200);

        // Extract identifier from response
        let body: Value = serde_json::from_str(upload_body_str).unwrap();
        let identifier = body["identifier"].as_str().unwrap();

        let req = test::TestRequest::get()
            .uri(&format!(
                "/spreadsheet/{}/2904%20Inventory/duplicates?columns={}",
                identifier,
                urlencoding::encode("UPC Nbr,Description"),
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
        debug!("Find duplicates response body: {}", body);
        assert_eq!(status, 200);

        // Verify response structure
        let body: Value = serde_json::from_str(body).unwrap();
        assert!(body["count"].is_u64());
        assert_eq!(body["count"].as_u64().unwrap(), 70);
        assert!(body["rows"].is_array());
        assert!(body["row_indexes"].is_array());
    }
}
