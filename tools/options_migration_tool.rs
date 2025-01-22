use anyhow::Result;
use log::info;

fn main() ->Result<()>
{
	// Set the logging level and initialize the logger
	std::env::set_var("RUST_LOG", "debug");
	env_logger::init();
	
	info!("hello world");

	Ok(())
}