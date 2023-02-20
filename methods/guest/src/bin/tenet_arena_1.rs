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

use risc0_zkvm_guest::env;

risc0_zkvm_guest::entry!(main);

use tenet_core::Deck;

fn is_valid(deck: Deck) -> bool {
    for card: Card in deck.cards {
        if card.health == 0 {
            return false
        }

        let sum = card.health + card.attack;
        if sum !== 10 {
            return false
        }
    }
    return true
}

pub fn main() {

    let player1_id: String = env::read();
    let creation1: Deck = env::read();

    let player2_id: String = env::read();
    let creation2: Deck = env::read();

    // Check if creations are valid
    if !is_valid(creation1) {
        panic!("Invalid deck by player 1")
    }
    if !is_valid(creation2) {
        panic!("Invalid deck by player 2")
    }

    // let creation1_hash ;
    // let creation2_hash ;
    let winner_id = None;
    let winner_creation_hash = None;

    // Run the logic
    let creation1_idx = 0;
    let creation2_idx = 0;
    let mut player1_card = Some(creation1.cards[creation1_idx]);
    let mut player2_card = Some(creation2.cards[creation2_idx]);
    while player1_card.is_some() && player2_card.is_some() {

        // First player 1 attacks, and we see the possible damage, decide the next player 2 card
        let player1_damage = player1_card.attack;
        let player2_damage = player2_card.attack;

        while player1_damage > 0 && player2_card.is_some() {
            let player2_card_use = player2_card.unwrap();
            if player2_card_use.health > player1_damage {
                player2_card_use.health -= player1_damage;
                player1_damage = 0;
            } else {
                player1_damage -= player2_card_use.health;
                player2_card_use.health = 0;

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
            let player1_card_use = player1_card.unwrap();
            if player1_card_use.health > player2_damage {
                player1_card_use.health -= player2_damage;
                player2_damage = 0;
            } else {
                player2_damage -= player1_card_use.health;
                player1_card_use.health = 0;

                // Move to next card
                creation1_idx += 1;
                if creation1_idx >= creation1.cards.len() {
                    player1_card = None;
                } else {
                    player1_card = Some(creation2.cards[creation1_idx]);
                }
            }
        }
    }

    if player1_card.is_some(){
        // player 1 wins
    } else if player2_card.is_some() {
        // player 2 wins
    } else {
        // TODO: handle tie
    }

    // Load the first number from the host
    let a: u64 = env::read();
    // Load the second number from the host
    let b: u64 = env::read();
    // Verify that neither of them are 1 (i.e. nontrivial factors)
    if a == 1 || b == 1 {
        panic!("Trivial factors")
    }
    // Compute the product while being careful with integer overflow
    let product = a.checked_mul(b).expect("Integer overflow");
    env::commit(&product);
}