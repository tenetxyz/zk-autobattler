use dotenv::dotenv;
use axum::{
    routing::{get, post},
    http::StatusCode,
    response::IntoResponse,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use mongodb::{bson::doc, options::ClientOptions, Client};

use methods::{MULTIPLY_ID, MULTIPLY_PATH};
use risc0_zkvm::host::Prover;
use risc0_zkvm::serde::{from_slice, to_vec};

// the input to our `create_user` handler
#[derive(Deserialize)]
struct FactorsInput {
    a: u64,
    b: u64
}

#[derive(Deserialize, Serialize)]
pub struct Receipt {
    journal: Vec<u8>,
    seal: Vec<u32>,
}

#[tokio::main]
async fn main() {
    dotenv().ok(); // This line loads the environment variables from the ".env" file.

    // initialize tracing
    tracing_subscriber::fmt::init();

    let mongodb_uri = std::env::var("MONGODB_URI").expect("MONGODB_URI must be set.");

    // Parse your connection string into an options struct
    let mut client_options =
        ClientOptions::parse(mongodb_uri)
            .await.unwrap();
    // Manually set an option
    client_options.app_name = Some("Tenet DB".to_string());
    // Get a handle to the cluster
    let client = Client::with_options(client_options).unwrap();
    // Ping the server to see if you can connect to the cluster
    client
        .database("admin")
        .run_command(doc! {"ping": 1}, None)
        .await.unwrap();
    tracing::info!("Database connected successfully.");

    // build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/", get(root))
        // `POST /users` goes to `create_user`
        .route("/prove", post(prove_factors));

    // run our app with hyper
    // `axum::Server` is a re-export of `hyper::Server`
    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}



// basic handler that responds with a static string
async fn root() -> &'static str {
    "Hello, Tenet!"
}

async fn prove_factors(
    // this argument tells axum to parse the request body
    Json(payload): Json<FactorsInput>,
) -> impl IntoResponse {
    println!("prove_factors");

    let out = match do_factors_proof(payload) {
        Ok(receipt) => receipt,
        Err(_e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                String::from("bad proof load"),
            )
        }
    };
    (StatusCode::OK, out)
}

fn do_factors_proof(payload: FactorsInput) -> Result<String, risc0_zkvm::host::Exception>  {
    // Pick two numbers
    let a: u64 = payload.a;
    let b: u64 = payload.b;

    // Multiply them inside the ZKP
    // First, we make the prover, loading the 'multiply' method
    let multiply_src = std::fs::read(MULTIPLY_PATH)
        .expect("Method code should be present at the specified path; did you use the correct *_PATH constant?");
    let mut prover = Prover::new(&multiply_src, MULTIPLY_ID).expect(
        "Prover should be constructed from valid method source code and corresponding method ID",
    );

    // Next we send a & b to the guest
    prover.add_input(to_vec(&a).unwrap().as_slice()).unwrap();
    prover.add_input(to_vec(&b).unwrap().as_slice()).unwrap();
    // Run prover & generate receipt
    let receipt = prover.run()
        .expect("Valid code should be provable if it doesn't overflow the cycle limit. See `embed_methods_with_options` for information on adjusting maximum cycle count.");

    println!("Proof done!");

    // // Extract journal of receipt (i.e. output c, where c = a * b)
    // let c: u64 = from_slice(
    //     &receipt
    //         .get_journal_vec()
    //         .expect("Journal should be available for valid receipts"),
    // )
    // .expect("Journal output should deserialize into the same types (& order) that it was written");

    // // Print an assertion
    // println!("I know the factors of {}, and I can prove it!", c);

    // // Here is where one would send 'receipt' over the network...

    // // Verify receipt, panic if it's wrong
    // receipt.verify(MULTIPLY_ID).expect(
    //     "Code you have proven should successfully verify; did you specify the correct method ID?",
    // );


    let receipt = Receipt {
        journal: receipt.get_journal().unwrap().to_vec(),
        seal: receipt.get_seal().unwrap().to_vec(),
    };

    Ok(base64::encode(bincode::serialize(&receipt).unwrap()))
}