#[cfg(test)]
mod tests {
    use actix_web::{test, web, App};
    use log::{error, info};
    use pricing_app_lib::constants::initialize_asset_directories;
    use pricing_app_lib::icons_endpoint::configure;

    #[actix_web::test]
    async fn test_get_missing_icon() {
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();
        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;
        let req = test::TestRequest::get()
            .uri("/icons/missing.png")
            .to_request();
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        assert_eq!(status, 404);
    }
    #[actix_web::test]
    async fn test_upload_icon() {
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();
        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // Read the test file
        let file =
            std::fs::read("../../tests/assets/icon.jpg").expect("Unable to read test icon file");
        let req = test::TestRequest::post()
            .uri("/icons?overwrite=true")
            .set_payload(file)
            .insert_header(("content-disposition", "attachment; filename=test_cat.jpg"))
            .to_request();
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        if status != 200 {
            let body = test::read_body(resp).await.to_vec();
            let body = body.as_slice();
            let body = String::from_utf8(body.to_vec()).unwrap();
            error!(
                "Upload icon response failed with status: {} and body: {:?}",
                status, body
            )
        }
        assert_eq!(status, 200);
    }
    #[actix_web::test]
    async fn test_upload_no_overwrite_icon() {
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();
        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // Read the test file
        let file =
            std::fs::read("../../tests/assets/icon.jpg").expect("Unable to read test icon file");
        let req = test::TestRequest::post()
            .uri("/icons")
            .set_payload(file)
            .insert_header(("content-disposition", "attachment; filename=test_cat.jpg"))
            .to_request();
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        if status != 200 {
            let body = test::read_body(resp).await.to_vec();
            let body = body.as_slice();
            let body = String::from_utf8(body.to_vec()).unwrap();
            error!(
                "Upload icon response failed with status: {} and body: {:?}",
                status, body
            )
        }
        assert_eq!(status, 200);
    }
    #[actix_web::test]
    async fn test_upload_missing_filename_icon() {
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();
        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // Read the test file
        let file =
            std::fs::read("../../tests/assets/icon.jpg").expect("Unable to read test icon file");
        let req = test::TestRequest::post()
            .uri("/icons")
            .set_payload(file)
            .to_request();
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        let body = test::read_body(resp).await.to_vec();
        let body = body.as_slice();
        let body = String::from_utf8(body.to_vec()).unwrap();
        info!(
            "Upload icon responded with status: {} and body: {:?}",
            status, body
        );
        assert_eq!(status, 400);
    }
    #[actix_web::test]
    async fn test_get_icons() {
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();

        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // Read the test file
        let file =
            std::fs::read("../../tests/assets/icon.jpg").expect("Unable to read test icon file");
        let req = test::TestRequest::post()
            .uri("/icons?overwrite=true")
            .set_payload(file)
            .insert_header(("content-disposition", "attachment; filename=test_cat.jpg"))
            .to_request();
        _ = test::call_service(&app, req).await;

        let req = test::TestRequest::get().uri("/icons").to_request();
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        if status != 200 {
            let body = test::read_body(resp).await.to_vec();
            let body = body.as_slice();
            let body = String::from_utf8(body.to_vec()).unwrap();
            error!(
                "Get icons response failed with status: {} and body: {:?}",
                status, body
            )
        }
        assert_eq!(status, 200)
    }
    #[actix_web::test]
    async fn test_get_icon() {
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        initialize_asset_directories().unwrap();
        let app = test::init_service(
            App::new().configure(|cfg| configure(cfg.service(web::scope("/api")))),
        )
        .await;

        // Read the test file
        let file =
            std::fs::read("../../tests/assets/icon.jpg").expect("Unable to read test icon file");
        let req = test::TestRequest::post()
            .uri("/icons?overwrite=true")
            .set_payload(file)
            .insert_header(("content-disposition", "attachment; filename=test_cat.jpg"))
            .to_request();
        _ = test::call_service(&app, req).await;

        let req = test::TestRequest::get()
            .uri("/icons/test_cat.jpg")
            .to_request();
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        let body = test::read_body(resp).await.to_vec();
        if status != 200 {
            let body = body.as_slice();
            let body = String::from_utf8(body.to_vec()).unwrap();
            error!(
                "Get icon response failed with status: {} and body: {:?}",
                status, body
            )
        }
        assert_eq!(status, 200);
        assert!(!body.is_empty(), "Response body is empty");
    }
}
