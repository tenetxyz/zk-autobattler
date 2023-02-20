use axum::{extract::Extension, http::StatusCode, response::IntoResponse, Json};
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

// DB
use mongodb::bson::doc;
use mongodb::bson::Document;
use mongodb::Database;

// ZK VM
use risc0_zkvm::host::Prover;
use risc0_zkvm::serde::{from_slice, to_vec};

// Custom Modules
use methods::{TENET_ARENA_1_ID, TENET_ARENA_1_PATH};

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
        lobby_id: String::from(""),
        error: String::from(""),
    };
    let lobbies = db.collection::<Document>("lobby");

    let player_id: String = payload.player_id;
    let lobby_id: String = payload.lobby_id;
    if lobby_id.is_empty() {
        // check for existing open lobbies
        let open_lobby = lobbies
            .find_one(
                doc! {
                    "player2_id": null,
                    "player1_id": {
                        "$ne": player_id.clone()
                    }
                },
                None,
            )
            .await
            .unwrap();
        if open_lobby.is_some() {
            // join the lobby
            let lobby = open_lobby.unwrap();
            let lobby_id = lobby.get("_id").unwrap().as_object_id().unwrap();
            let update_result = lobbies
                .update_one(
                    doc! {
                        "_id": lobby_id,
                    },
                    doc! {
                        "$set": { "player2_id": player_id }
                    },
                    None,
                )
                .await
                .unwrap();

            response.lobby_id = lobby_id.to_string();
        } else {
            // if no open lobbies, create a new one
            let new_lobby = doc! {
                "lobby_id": null,
                "player1_id": player_id,
                "player2_id": null,
            };
            let insert_result = lobbies.insert_one(new_lobby.clone(), None).await.unwrap();
            let newlobby_id = insert_result.inserted_id.as_object_id().unwrap();

            let update_result = lobbies
                .update_one(
                    doc! {
                        "_id": newlobby_id,
                    },
                    doc! {
                        "$set": { "lobby_id": newlobby_id.to_string() }
                    },
                    None,
                )
                .await
                .unwrap();

            response.lobby_id = newlobby_id.to_string();
        }
    } else {
        // join this specific lobby, fail if already full
        let update_result = lobbies
            .update_one(
                doc! {
                    "lobby_id": lobby_id.clone(),
                    "player1_id": {
                        "$ne": player_id.clone()
                    },
                    "player2_id": null,
                },
                doc! {
                    "$set": { "player2_id": player_id }
                },
                None,
            )
            .await
            .unwrap();
        if update_result.modified_count == 1 {
            response.lobby_id = lobby_id;
        } else {
            // TODO: Separate is full vs does not exist vs already in it
            response.error = String::from("Lobby is full or does not exist");
            return (StatusCode::BAD_REQUEST,  Json(response));
        }
    }

    return (StatusCode::OK, Json(response));
}

async fn commence_battle(game: games::Game){
    // start the battle with both user inputs

    // call the verify function with generated proof of battle
    // once battle is done, update the game document
    // remove the user creations and add the battle result
}

// TODO: Which hash function to use?
pub async fn play_game(
    // this argument tells axum to parse the request body
    Json(payload): Json<games::PlayGameInput>,
    Extension(db): Extension<Database>,
) -> impl IntoResponse {
    tracing::info!("play_game called");

    let lobby_id = payload.lobby_id;
    let mut response = games::PlayGameOutput {
        error: String::from(""),
    };

    // check if lobby exists
    let lobbies = db.collection::<Document>("lobby");
    let lobby = lobbies
        .find_one(
            doc! {
                "lobby_id": lobby_id.clone(),
            },
            None,
        )
        .await
        .unwrap();
    if lobby.is_none() {
        response.error = String::from("Lobby does not exist");
        return (
            StatusCode::BAD_REQUEST,
            Json(response),
        );
    }

    // lobby.unwrap()
    let lobby = bson::to_bson(&lobby.unwrap()).unwrap();
    let lobby = bson::from_bson::<games::Lobby>(lobby).unwrap();
    // from_bson::<games::Lobby>(lobby);

    let player1_id = lobby.player1_id;
    let player2_id = lobby.player2_id;
    let is_player_1 = player1_id == payload.player_id;

    if !is_player_1 && player2_id != payload.player_id {
        response.error = String::from("Player is not in this lobby");
        return (
            StatusCode::BAD_REQUEST,
            Json(response),
        );
    }

    // check if game document exists
    let games = db.collection::<Document>("game");
    let game = games
        .find_one(
            doc! {
                "lobby_id": lobby_id.clone(),
            },
            None,
        )
        .await
        .unwrap();

    if game.is_none() {
        let arena_hash = TENET_ARENA_1_ID;
        let mut s = DefaultHasher::new();
        arena_hash.hash(&mut s);
        let arena_hash = s.finish().to_string();

        let creation_bson = bson::to_bson(&payload.creation).unwrap();

        let creation_hash = payload.creation;
        let mut s = DefaultHasher::new();
        creation_hash.hash(&mut s);
        let creation_hash = s.finish().to_string();

        let mut new_game = doc! {
            "lobby_id": lobby_id,
            "player1_id": player1_id,
            "player2_id": player2_id,
            "creation1": null,
            "creation1_hash": null,
            "creation2": null,
            "creation2_hash": null,
            "arena_hash": arena_hash,
            "winner_creation_hash": null,
            "winner_id": null,
            "state": null,
        };

        if is_player_1 {
            new_game.insert("state", "player2Turn");
            new_game.insert("creation1",  creation_bson);
            new_game.insert("creation1Hash",  creation_hash);
        } else {
            new_game.insert("state", "player1Turn");
            new_game.insert("creation2", creation_bson);
            new_game.insert("creation2Hash",  creation_hash);
        }

        // create it
        let insert_result = games.insert_one(new_game.clone(), None).await.unwrap();
    } else {
        // game exists, check if it's in the right state
        let game_doc = game.unwrap();
        let game_id = game_doc.get("_id").unwrap().as_object_id().unwrap();
        let game = bson::to_bson(&game_doc).unwrap();
        let game = bson::from_bson::<games::Game>(game).unwrap();

        if (game.state == "player1Turn" && !is_player_1) || (game.state == "player2Turn" && is_player_1) {
            response.error = String::from("It's not your turn");
            return (
                StatusCode::BAD_REQUEST,
                Json(response),
            );
        }

        if game.state == "playing" || game.state == "complete" {
            response.error = String::from("Game is in progress or already over");
            return (
                StatusCode::BAD_REQUEST,
                Json(response),
            );
        }

        let creation_bson = bson::to_bson(&payload.creation).unwrap();
        let creation_hash = payload.creation;
        let mut s = DefaultHasher::new();
        creation_hash.hash(&mut s);
        let creation_hash = s.finish().to_string();

        let mut new_game_doc = None;

        // Check if creation exists
        if game.state == "player1Turn" {
            if creation_hash == game.creation1_hash {
                // COMMENCE AUTO BATTLE
                new_game_doc = Some(doc! {
                    "$set": {
                        "state": "playing",
                    }
                });
                commence_battle(game);
            } else {
                new_game_doc = Some(doc! {
                    "$set": {
                        "creation1": creation_bson,
                        "creation1_hash": creation_hash,
                        "state": "player2Turn",
                    }
                });
            }
        }  else if game.state == "player2Turn" {
            if creation_hash == game.creation2_hash {
                // COMMENCE AUTO BATTLE
                new_game_doc = Some(doc! {
                    "$set": {
                        "state": "playing",
                    }
                });
                commence_battle(game);
            } else {
                // update game state
                new_game_doc = Some(doc! {
                    "$set": {
                        "creation2": creation_bson,
                        "creation2_hash": creation_hash,
                        "state": "player1Turn",
                    }
                });
            }
        }

         // update game state
         let update_result = games
         .update_one(
             doc! {
                 "_id": game_id,
             },
             new_game_doc.unwrap(),
             None,
         )
         .await
         .unwrap();
        // Check if creation changed
    }

    return (StatusCode::OK, Json(response));
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
    let multiply_src = std::fs::read(TENET_ARENA_1_PATH)
        .expect("Method code should be present at the specified path; did you use the correct *_PATH constant?");
    let mut prover = Prover::new(&multiply_src, TENET_ARENA_1_ID).expect(
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
