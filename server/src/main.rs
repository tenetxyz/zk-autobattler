// Utils
use dotenv::dotenv;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// Web Server
use axum::{
    extract::State,
    http::Method,
    routing::{get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

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
    let db = client.database("Cluster0");

    let cors = CorsLayer::new().allow_methods(Any).allow_origin(Any);

    let games_routes = Router::new()
        .route("/", get(controllers::games::get_all_games))
        .route("/join", post(controllers::games::join_game))
        .route("/play", post(controllers::games::play_game))
        .route("/commit", post(controllers::games::commit_outcome));
    // .route("/commit", post(commit_outcome));
    // .route("/play", post(play_game));

    let player_routes = Router::new().route("/games", get(controllers::players::get_player_games));

    let app = Router::new()
        .route("/", get(root))
        .nest("/games", games_routes)
        .nest("/player", player_routes)
        // TODO: Replace with a real CORS policy
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(db);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .expect("Failed to start server");
}

// basic handler that responds with a static string
async fn root() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "tenet",
    }))
}
