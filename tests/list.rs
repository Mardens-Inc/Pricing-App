mod tests {
    use crate::setup_app;
    use actix_web::test;
    use log::*;
    use pricing_app_lib::list_data::LocationListItem;
    use serde_json::Value;

    #[actix_web::test]
    async fn test_get_all_locations() {
        let app = setup_app!();
        let req = test::TestRequest::get().uri("/list/").to_request();
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        assert_eq!(status, 200);

        // Test the JSON response.
        let body = test::read_body(resp).await.to_vec();
        let body = body.as_slice();
        let body = String::from_utf8(body.to_vec()).unwrap();
        debug!("{:?}", body);
        let body = serde_json::from_str::<Value>(&body).unwrap();
        assert!(body.is_array());
    }

    #[actix_web::test]
    async fn test_create_location() {
        let app = setup_app!();

        let item = LocationListItem {
            id: None,
            name: "Test Database".to_string(),
            location: "Test Location".to_string(),
            po: "123456".to_string(),
            image: "amazon.png".to_string(),
            post_date: Default::default(),
        };

        let req = test::TestRequest::post()
            .uri("/list/")
            .set_payload(serde_json::to_string(&item).unwrap())
            .to_request();
        let resp = test::call_service(&app, req).await;
        let status = resp.status();
        assert_eq!(status, 200);
    }
}
#[macro_export]
macro_rules! setup_app {
    () => {{
        // Set the environment variable and initialize logging.
        std::env::set_var("RUST_LOG", "debug");
        let _ = env_logger::try_init();

        // Fetch database connection data
        let data = pricing_app_lib::data_database_connection::DatabaseConnectionData::get()
            .await
            .unwrap();

        // Initialize necessary databases
        let pool = pricing_app_lib::data_database_connection::create_pool(&data)
            .await
            .unwrap();
        pricing_app_lib::list_db::initialize(&pool).await.unwrap();
        pricing_app_lib::options_db::initialize(&pool)
            .await
            .unwrap();
        pool.close().await;

        let connection_data_mutex = actix_web::web::Data::new(std::sync::Arc::new(data));

        // Initialize the Actix web service.
        actix_web::test::init_service(
            actix_web::App::new()
                // Configure the app by scoping your list endpoint under `/api`.
                .configure(|cfg| {
                    pricing_app_lib::list_endpoint::configure(
                        cfg.service(actix_web::web::scope("/api")),
                    )
                })
                .app_data(connection_data_mutex),
        )
        .await
    }};
}
