// Copyright 2023 RISC Zero, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#![no_main]

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

use risc0_zkvm::guest::env;

risc0_zkvm::guest::entry!(main);

use tenet_core;

fn is_valid(deck: tenet_core::Deck) -> bool {
    for card in deck.cards {
        if card.health == 0 {
            return false
        }

        let sum = card.health + card.attack;
        if sum != 10 {
            return false
        }
    }
    return true
}

pub fn main() {

    let player1_id: String = env::read();
    let o_creation1: tenet_core::Deck = env::read();

    let player2_id: String = env::read();
    let o_creation2: tenet_core::Deck = env::read();

    // Check if creations are valid
    if !is_valid(o_creation1) {
        panic!("Invalid deck by player 1")
    }
    if !is_valid(o_creation2) {
        panic!("Invalid deck by player 2")
    }

    let mut creation1 = o_creation1.clone();
    let mut creation2 = o_creation2.clone();

    // let creation1_hash ;
    // let creation2_hash ;
    let mut winner_id = String::from("");
    let mut winner_creation_hash = String::from("");

    // Run the logic
    let mut creation1_idx = 0;
    let mut creation2_idx = 0;

    let mut player1_card = Some(creation1.cards[creation1_idx]);
    let mut player2_card = Some(creation2.cards[creation2_idx]);

    while player1_card.is_some() && player2_card.is_some() {

        // First player 1 attacks, and we see the possible damage, decide the next player 2 card
        let mut player1_damage = player1_card.unwrap().attack;
        let mut player2_damage = player2_card.unwrap().attack;

        while player1_damage > 0 && player2_card.is_some() {
            let mut player2_card_use = player2_card.unwrap();
            if player2_card_use.health > player1_damage {
                player2_card_use.health -= player1_damage;
                creation2.cards[creation2_idx] = player2_card_use;
                player2_card = Some(player2_card_use);
                player1_damage = 0;
            } else {
                player1_damage -= player2_card_use.health;
                player2_card_use.health = 0;
                creation2.cards[creation2_idx] = player2_card_use;

                // Move to next card
                creation2_idx += 1;
                if creation2_idx >= creation2.cards.len() {
                    player2_card = None;
                } else {
                    player2_card = Some(creation2.cards[creation2_idx]);
                }
            }
        }

        // Second, player 1 attacks
        while player2_damage > 0 && player1_card.is_some() {
            let mut player1_card_use = player1_card.unwrap();
            if player1_card_use.health > player2_damage {
                player1_card_use.health -= player2_damage;
                creation1.cards[creation1_idx] = player1_card_use;
                player1_card = Some(player1_card_use);
                player2_damage = 0;
            } else {
                player2_damage -= player1_card_use.health;
                player1_card_use.health = 0;
                creation1.cards[creation1_idx] = player1_card_use;

                // Move to next card
                creation1_idx += 1;
                if creation1_idx >= creation1.cards.len() {
                    player1_card = None;
                } else {
                    player1_card = Some(creation1.cards[creation1_idx]);
                }
            }
        }
    }

    let creation1_hash = o_creation1;
    let mut s = DefaultHasher::new();
    creation1_hash.hash(&mut s);
    let creation1_hash = s.finish().to_string();

    let creation2_hash = o_creation2;
    let mut s = DefaultHasher::new();
    creation2_hash.hash(&mut s);
    let creation2_hash = s.finish().to_string();

    let mut result = String::from("");
    if player1_card.is_some(){
        // player 1 wins
        winner_id = player1_id.clone();
        winner_creation_hash = creation1_hash.clone();
        result = String::from("PLAYER1_WINS");
    } else if player2_card.is_some() {
        // player 2 wins
        winner_id = player2_id.clone();
        winner_creation_hash = creation2_hash.clone();
        result = String::from("PLAYER2_WINS");
    } else {
        // tie
        result = String::from("TIE");
    }

    // let game_result = tenet_core::GameResult {
    //     player1_id: player1_id,
    //     player2_id: player2_id,
    //     creation1_hash: creation1_hash,
    //     creation2_hash: creation2_hash,
    //     winner_creation_hash: winner_creation_hash,
    //     winner_id: winner_id,
    //     result: result,
    // };

    // let game_result = tenet_core::GameResult {
    //     player1_id: String::from("player1_id"),
    //     player2_id: String::from("player2_id"),
    //     creation1_hash: String::from("creation1_hash"),
    //     creation2_hash: String::from("creation2_hash"),
    //     winner_creation_hash: String::from("winner_creation_hash"),
    //     winner_id: String::from("winner_id"),
    //     result: String::from("result")
    // };

    env::commit(&result);
}