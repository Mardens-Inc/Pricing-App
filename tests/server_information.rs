mod tests {
	use actix_web::{test, web, App};
	use pricing_app_lib::constants::VERSION;
	use pricing_app_lib::server_information_endpoint::get_server_version;

	#[actix_web::test]
    async fn test_get_server_version() {
        std::env::set_var("RUST_LOG", "debug");
        _ = env_logger::try_init();
        let app = test::init_service(App::new().configure(|cfg| {
            cfg.service(web::scope("api").service(get_server_version));
        }))
        .await;
		
		let req = test::TestRequest::get().uri("/api/version").to_request();
		let resp = test::call_service(&app, req).await;
		let status = resp.status();
		assert_eq!(status, 200);
		let body = test::read_body(resp).await.to_vec();
		let body = body.as_slice();
		let body = String::from_utf8(body.to_vec()).unwrap();
		assert_eq!(body, VERSION);
		
    }
}
