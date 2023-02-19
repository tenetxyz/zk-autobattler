use axum::{extract::Extension, http::StatusCode, response::IntoResponse, Json};


// DB
use mongodb::bson::doc;
use mongodb::bson::Document;
use mongodb::Database;

// ZK VM
use risc0_zkvm::host::Prover;
use risc0_zkvm::serde::{from_slice, to_vec};

// Custom Modules
use methods::{MULTIPLY_ID, MULTIPLY_PATH};

use crate::models::games;

pub async fn get_all_games(Extension(db): Extension<Database>) -> impl IntoResponse {
    tracing::info!("get_all_games called");

    let out = "Done";

    (StatusCode::OK, out)
}

pub async fn join_game(
    // this argument tells axum to parse the request body
    Json(payload): Json<games::JoinGameInput>,
    Extension(db): Extension<Database>,
) -> impl IntoResponse {
    tracing::info!("join_game called");

    let mut response = games::JoinGameOutput {
        lobbyId: String::from(""),
        error: String::from(""),
    };
    let lobbies = db.collection::<Document>("lobby");

    let playerId: String = payload.playerId;
    let lobbyId: String = payload.lobbyId;
    if lobbyId.is_empty() {
        // check for existing open lobbies
        let open_lobby = lobbies
            .find_one(
                doc! {
                    "player2ID": null,
                    "player1ID": {
                        "$ne": playerId.clone()
                    }
                },
                None,
            )
            .await
            .unwrap();
        if open_lobby.is_some() {
            // join the lobby
            let lobby = open_lobby.unwrap();
            let lobbyId = lobby.get("_id").unwrap().as_object_id().unwrap();
            let update_result = lobbies
                .update_one(
                    doc! {
                        "_id": lobbyId,
                    },
                    doc! {
                        "$set": { "player2ID": playerId }
                    },
                    None,
                )
                .await
                .unwrap();

            response.lobbyId = lobbyId.to_string();
        } else {
            // if no open lobbies, create a new one
            let new_lobby = doc! {
                "lobbyId": null,
                "player1ID": playerId,
                "player2ID": null,
            };
            let insert_result = lobbies.insert_one(new_lobby.clone(), None).await.unwrap();
            let newLobbyId = insert_result.inserted_id.as_object_id().unwrap();

            let update_result = lobbies
                .update_one(
                    doc! {
                        "_id": newLobbyId,
                    },
                    doc! {
                        "$set": { "lobbyId": newLobbyId.to_string() }
                    },
                    None,
                )
                .await
                .unwrap();

            response.lobbyId = newLobbyId.to_string();
        }
    } else {
        // join this specific lobby, fail if already full
        let update_result = lobbies
            .update_one(
                doc! {
                    "lobbyId": lobbyId.clone(),
                    "player1ID": {
                        "$ne": playerId.clone()
                    },
                    "player2ID": null,
                },
                doc! {
                    "$set": { "player2ID": playerId }
                },
                None,
            )
            .await
            .unwrap();
        if update_result.modified_count == 1 {
            response.lobbyId = lobbyId;
        } else {
            // TODO: Separate is full vs does not exist vs already in it
            response.error = String::from("Lobby is full or does not exist");
            return (StatusCode::BAD_REQUEST,  Json(response));
        }
    }

    return (StatusCode::OK, Json(response));
}

pub async fn play_game(
    // this argument tells axum to parse the request body
    Json(payload): Json<games::PlayGameInput>,
    Extension(db): Extension<Database>,
) -> impl IntoResponse {
    tracing::info!("play_game called");

    let out = "Done";

    (StatusCode::OK, out)
}

pub async fn commit_outcome(
    // this argument tells axum to parse the request body
    Json(payload): Json<games::CommitOutcomeInput>,
    Extension(db): Extension<Database>,
) -> impl IntoResponse {
    tracing::info!("commit_outcome called");

    let out = "Done";

    (StatusCode::OK, out)
}

pub async fn prove_factors(
    // this argument tells axum to parse the request body
    Json(payload): Json<games::FactorsInput>,
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

fn do_factors_proof(payload: games::FactorsInput) -> Result<String, risc0_zkvm::host::Exception> {
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

    let receipt = games::Receipt {
        journal: receipt.get_journal().unwrap().to_vec(),
        seal: receipt.get_seal().unwrap().to_vec(),
    };

    Ok(base64::encode(bincode::serialize(&receipt).unwrap()))
}
