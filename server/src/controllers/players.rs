use axum::{extract::State, extract::Query, http::StatusCode, response::IntoResponse, Json};

// DB
use mongodb::bson::doc;
use mongodb::bson::Document;
use mongodb::{Collection, Database};

use crate::models::games;

pub async fn get_player_games(State(db): State<Database>, player_info: Query<games::PlayerInfo>) -> impl IntoResponse {
    tracing::info!("get_player_games called");

    // get lobbies the player is in, either player1_id field is player_id or player2_id field is player_id
    let lobbies = db.collection::<Document>("lobby");
    let mut cursor = lobbies
        .find(
            doc! {
                "$or": [
                    {"player1_id": player_info.player_id.clone()},
                    {"player2_id": player_info.player_id.clone()}
                ]
            },
            None,
        )
        .await
        .unwrap();

    let mut games: Vec<games::Game> = Vec::new();

      // go through each document
      while cursor.advance().await.unwrap() {
        let lobby = bson::to_bson(&cursor.deserialize_current().unwrap()).unwrap();
        let mut lobby = bson::from_bson::<games::Lobby>(lobby).unwrap();
        // get single game object for this lobby if it exists
        let games_ref = db.collection::<Document>("game");
        let mut game_for_lobby = games_ref
            .find_one(
                doc! {
                    "lobby_id": lobby.lobby_id.clone()
                },
                None,
            )
            .await
            .unwrap();

        if game_for_lobby.is_some() {
            let game = bson::to_bson(&game_for_lobby.unwrap()).unwrap();
            let mut game = bson::from_bson::<games::Game>(game).unwrap();
            game.id = None;
            game.creation1 = None;
            game.creation2 = None;
            games.push(game);
        } else {
            // make game for lobby
            let mut game = games::Game {
                id: None,
                lobby_id: lobby.lobby_id.clone(),
                creation1: None,
                creation1_hash: None,
                creation2: None,
                creation2_hash: None,
                player1_id: "".to_string(),
                player2_id: "".to_string(),
                arena_hash: "".to_string(),
                winner_creation_hash: None,
                winner_id: None,
                state: "lobby".to_string(),
                result: None,
            };
            if lobby.player1_id.is_some() {
                game.player1_id = lobby.player1_id.unwrap().clone();
            }
            if lobby.player2_id.is_some() {
                game.player2_id = lobby.player2_id.unwrap().clone();
            }
            if !game.player1_id.is_empty() && !game.player2_id.is_empty() {
                game.state = "setup".to_string();
            }

            games.push(game);
        }
    }

    let response = games::PlayerGamesOutput {
        games: games,
        error: String::from(""),
    };

    (StatusCode::OK, Json(response))
}