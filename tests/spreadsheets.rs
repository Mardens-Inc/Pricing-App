#[cfg(test)]
mod tests {
	use actix_web::{test, web, App};
	use pricing_app_lib::constants::initialize_asset_directories;
	use pricing_app_lib::spreadsheet_endpoint::configure;

	#[actix_web::test]
    async fn prepare_excel_sheet() {
        // Set the logging level and initialize the logger
        std::env::set_var("RUST_LOG", "debug");
        env_logger::init();
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
        assert_eq!(resp.status(), 200);
    }

    #[actix_web::test]
    async fn prepare_csv_sheet() {
        // Set the logging level and initialize the logger
        std::env::set_var("RUST_LOG", "debug");
        env_logger::init();
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
        assert_eq!(resp.status(), 200);
    }
}
