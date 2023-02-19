// Utils
use dotenv::dotenv;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// Web Server
use axum::{
    extract::Extension,
    routing::{get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};

// DB
use mongodb::{bson::doc, options::ClientOptions, Client};

// Custom Modules
mod controllers;
mod models;

async fn connect_db(mongodb_uri: String) -> Client {
    // Parse your connection string into an options struct
    let mut client_options = ClientOptions::parse(mongodb_uri).await.unwrap();

    // Manually set an option
    client_options.app_name = Some("Tenet DB".to_string());

    // Get a handle to the cluster
    let client = Client::with_options(client_options).unwrap();

    // Ping the server to see if you can connect to the cluster
    client
        .database("admin")
        .run_command(doc! {"ping": 1}, None)
        .await
        .unwrap();

    tracing::info!("Database connected successfully.");

    return client;
}

#[tokio::main]
async fn main() {
    dotenv().ok(); // This line loads the environment variables from the ".env" file.

    // initialize logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(tracing_subscriber::EnvFilter::from_env("RUST_LOG"))
        .init();

    // initialize db
    let mongodb_uri = std::env::var("MONGODB_URI").expect("MONGODB_URI must be set.");
    let client = connect_db(mongodb_uri).await;

    let cors = CorsLayer::new().allow_origin(Any);

    let games_routes = Router::new()
        .route("/", get(controllers::games::get_all_games))
        .route("/join", post(controllers::games::join_game))
        .route("/play", post(controllers::games::play_game))
        .route("/commit", post(controllers::games::commit_outcome));
    // .route("/commit", post(commit_outcome));
    // .route("/play", post(play_game));

    let app = Router::new()
        .route("/", get(root))
        .nest("/games", games_routes)
        .layer(cors)
        .layer(Extension(client));

    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .expect("Failed to start server");
}

// basic handler that responds with a static string
async fn root() -> axum::Json<serde_json::Value>  {
    axum::Json(serde_json::json!({
        "status": "tenet",
    }))
}