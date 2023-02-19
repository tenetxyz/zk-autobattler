# zk-autobattler

## Architecture
- `client/`
    - React JS app
    - Handles all the game logic that does not need to be verified
    - Talks to API to generate proofs and get values from DB
    - Handles storage of user creations
- `server/`
    - Rust backend API
    - Endpoints
        - `/players/new` (GET)
            - Returns a new player ID
        - `/games/join` (POST)
            - Input: optional_lobby_id
            - Join's a random lobby ID or creates a new one
            - Output: lobby ID on success
        - `/games/play` (POST)
            - Input: lobbyID, playerID, creation
            - Runs the arena code based on the lobbyID for the players once both players have committed their creations
            - Output: waiting for next player state or outcome proof
        - `/games/commit` (POST)
            - Input: proof from play
            - Verifies the proof and extracts the final outcome from the receipt
            - Updates the DB with the outcome
            - Output: success/fail
        - `/games/` (GET)
            - Returns all the finished games
    - Talks with the Risc Zero ZK VM to generate and verify proofs
    - Talks with database to store and provide the global records
- `methods/`
    - The code that will run inside the RiscZero ZK VM
    - Will be public so that people can verify it using the hash of it
    - In the initial case, it will be the first public auto battler area we build

### Database
- Initially, for the database we are going to use MongoDB
    - Anyone will be able to read from this database
    - And there will be an endpoint which anyone can submit a valid proof to update the database
- We understand this is a point of centralization, as we as the host of this database, could do anything we want with it. However, we chose to do this because the verifier for Risc Zero is currently in Rust and popular blockchains do not support it. Eventually, all these global records would be stored on-chain with contracts to read and write to them.
- DB Schema
    - Users collection
        - User Document
            - user_ID
    - Games Collection
        - Game Document
            - playerA_ID
            - playerB_ID
            - creationA_Hash
            - creationB_Hash
            - arena_hash
            - winnerCreation_Hash
            - state: [playerA_TURN, playerB_TURN, playing, complete]
            - lobby_id
    - Lobby Collection
        - Lobby Document
            - lobby_ID
            - playerA_ID
            - playerB_ID

### TODO
- How do users move creations between browsers? Or if they clear data in browser, do they loose it all?
- Brute force hash table problem