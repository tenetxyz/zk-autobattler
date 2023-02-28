import React, { useEffect, useState } from "react";
import { ForwardAuth, useAuth } from "../auth";
import { Deck, NPC, UserData } from "../models";
import {
  Card as RBCard,
  Form,
  Col,
  Row,
  Button,
  Modal,
  Spinner,
  Dropdown,
} from "react-bootstrap";
import { apiFetch } from "../utils";

import { AgGridReact } from "ag-grid-react";

import {
  ColumnApi,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  RowSelectedEvent,
  SelectionChangedEvent,
} from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "../styles/Play.scss";
import DeckView from "./DeckView";

interface PlayProps {
  userData: UserData | null;
}

const NPCS: NPC[] = [
  {
    name: "Goblin",
    deckHash: "7692005092496036419",
    deck: {
      id: 1,
      name: "Goblin",
      type: "BASIC_5",
      cards: [
        {
          attack: 5,
          health: 5,
        },
        {
          attack: 5,
          health: 5,
        },
        {
          attack: 5,
          health: 5,
        },
        {
          attack: 5,
          health: 5,
        },
        {
          attack: 6,
          health: 4,
        },
      ],
    },
  },
];

function Play(props: PlayProps) {
  const auth = useAuth();

  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [gridColumnApi, setGridColumnApi] = useState<ColumnApi | null>(null);
  const [rowData, setRowData] = useState([]);
  const [rowSelected, setRowSelected] = useState<any>(null);
  const [battledNPCIds, setBattledNPCIds] = useState<Set<string>>(new Set());

  const copyLobbyId = () => {
    console.log("copy lobby id");
  };

  const addPlayerDeck = () => {
    if (props.userData && props.userData.decks.length > 0) {
      let body = {
        player_id: auth.user,
        lobby_id: rowSelected.lobby_id,
        creation: props.userData?.decks[0],
      };

      setIsLoading(true);
      apiFetch(
        "games/play",
        "POST",
        body,
        (body: any, responseData: any) => {
          console.log(responseData);
          loadPlayerGames(auth.user);
        },
        (errorData: any, errorMsg: string) => {
          console.error(errorMsg);
        }
      );
    } else {
      // TODO: Show this to the user in a nicer way
      alert("You must have a deck to join a lobby");
    }
  };

  const refreshPlayerGames = () => {
    setIsLoading(true);
    loadPlayerGames(auth.user);
  }

  const STATE_TO_ACTIONS: any = {
    lobby: [
      {
        name: "Copy Lobby ID",
        onClick: copyLobbyId,
      },
    ],
    setup: [
      {
        name: "Add Deck",
        onClick: addPlayerDeck,
      },
    ],
    player2Turn: [
      {
        name: "Add Deck",
        onClick: addPlayerDeck,
      },
    ],
    player1Turn: [
      {
        name: "Add Deck",
        onClick: addPlayerDeck,
      },
    ],
    playing: [{
      name: "Refresh",
      onClick: refreshPlayerGames,
    }],
    complete: [],
  };

  const [columnDefs] = useState([
    { field: "player1_id", flex: 1, checkboxSelection: true },
    { field: "creation1_hash", flex: 1 },
    { field: "player2_id", flex: 1 },
    { field: "creation2_hash", flex: 1 },
    { field: "arena_hash", flex: 1 },
    { field: "lobby_id", flex: 1 },
    { field: "result", flex: 1 },
    { field: "state", flex: 1 },
  ]);

  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showJoinLobbyModal, setShowJoinLobbyModal] = useState(false);
  const [joinLobbyId, setJoinLobbyId] = useState<string>("");
  const [playerGames, setPlayerGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const viewDeck = (npc: NPC) => {
    setSelectedNPC(npc);
    setShowDeckModal(true);
  };

  const handleCloseDeckModal = () => {
    setSelectedNPC(null);
    setShowDeckModal(false);
  };

  const handleCloseJoinLobbyModal = () => {
    setShowJoinLobbyModal(false);
    setJoinLobbyId("");
    setErrorMsg(null);
  };

  const onGridReady = (params: GridReadyEvent) => {
    params.api.showLoadingOverlay();
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const loadPlayerGames = (player_id: string) => {
    apiFetch(
      "player/games?player_id=" + player_id,
      "GET",
      {},
      (body: any, responseData: any) => {
        setPlayerGames(responseData.games);
      },
      (errorData: any, errorMsg: string) => {
        console.error(errorMsg);
        // alert("API Error: " + errorMsg);
      }
    );
  };

  useEffect(() => {
    if (auth && !auth.isLoading && auth.user) {
      loadPlayerGames(auth.user);
    }
  }, [auth]);

  useEffect(() => {
    if (playerGames) {
      // console.log(playerGames);
      gridApi?.setRowData(playerGames);
      setRowSelected(null);
      setIsLoading(false);
      gridApi?.hideOverlay();
      // check if player has battled all NPCs using this current deck
      console.log(playerGames);
      playerGames.forEach((game: any) => {
        NPCS.forEach((npc: NPC) => {
          // TODO: Check player creation hash
          if (game.creation2_hash === npc.deckHash) {
            let newBattledNPCIds = new Set(battledNPCIds);
            newBattledNPCIds.add(npc.name);
            setBattledNPCIds(newBattledNPCIds);
          }
        });
      });
    }
  }, [gridApi, playerGames]);

  const onSelectionChanged = (event: SelectionChangedEvent) => {
    if (gridApi) {
      const newSelectedNodes = gridApi.getSelectedNodes();
      if (newSelectedNodes.length > 0) {
        let newSelectedRowData = newSelectedNodes[0].data;
        setRowSelected(newSelectedRowData);
      } else {
        setRowSelected(null);
      }
    }
  };

  const onCreateLobby = () => {
    let body = {
      player_id: auth.user,
      lobby_id: "",
      create_new: true,
    };
    setIsLoading(true);
    apiFetch(
      "games/join",
      "POST",
      body,
      (body: any, responseData: any) => {
        console.log(responseData);
        loadPlayerGames(auth.user);
      },
      (errorData: any, errorMsg: string) => {
        console.error(errorMsg);
      }
    );
  };

  const onJoinLobby = () => {
    setShowJoinLobbyModal(true);
    setJoinLobbyId("");
  };

  const joinLobby = () => {
    setIsLoading(true);
    let body = {
      player_id: auth.user,
      lobby_id: joinLobbyId,
      create_new: false,
    };
    apiFetch(
      "games/join",
      "POST",
      body,
      (body: any, responseData: any) => {
        console.log(responseData);
        loadPlayerGames(auth.user);
        setShowJoinLobbyModal(false);
      },
      (errorData: any, errorMsg: string) => {
        console.error(errorMsg);
        setErrorMsg(errorMsg);
        setIsLoading(false);
      }
    );
  };

  const onPlayRandom = () => {
    setIsLoading(true);
    let body = {
      player_id: auth.user,
      lobby_id: "",
      create_new: false,
    };
    apiFetch(
      "games/join",
      "POST",
      body,
      (body: any, responseData: any) => {
        console.log(responseData);
        loadPlayerGames(auth.user);
      },
      (errorData: any, errorMsg: string) => {
        console.error(errorMsg);
      }
    );
  }

  const onJoinLobbyIdChange = (event: any) => {
    setJoinLobbyId(event.target.value);
    setErrorMsg(null);
  };

  const battleNPC = (npc: NPC) => {
    if (props.userData && props.userData.decks.length > 0) {
      let body = {
        player_id: auth.user,
        creation: props.userData?.decks[0],
        npc_id: npc.name,
        npc_creation: npc.deck,
      };

      setIsLoading(true);
      apiFetch(
        "games/play/npc",
        "POST",
        body,
        (body: any, responseData: any) => {
          console.log(responseData);
          loadPlayerGames(auth.user);
        },
        (errorData: any, errorMsg: string) => {
          console.error(errorMsg);
        }
      );
    } else {
      // TODO: Show this to the user in a nicer way
      alert("You must have a deck to battle");
    }

  }

  return (
    <div className="pageContainer">
      <Modal
        show={showDeckModal}
        onHide={handleCloseDeckModal}
        dialogClassName="deckViewModal"
      >
        <Modal.Header closeButton>
          <Modal.Title>NPC {selectedNPC?.name} Deck</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNPC && (
            <DeckView
              cards={selectedNPC.deck.cards}
              onHealthValueChange={undefined}
              onAttackValueChange={undefined}
              disabled={true}
              errorMsg={undefined}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeckModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showJoinLobbyModal} onHide={handleCloseJoinLobbyModal}>
        <Modal.Header closeButton>
          <Modal.Title>Join a Lobby</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Lobby Id</Form.Label>
              <Form.Control
                type="text"
                placeholder="xyz"
                autoFocus
                value={joinLobbyId}
                onChange={onJoinLobbyIdChange}
              />
            </Form.Group>
          </Form>
          {errorMsg && <p className="errorMsg">{errorMsg}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseJoinLobbyModal}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={joinLobbyId.length === 0}
            onClick={joinLobby}
          >
            Join
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="pageHeaderWrapper">
        <p className="pageHeader">NPCs</p>
      </div>
      <div className="cardsContainer">
        {NPCS.map((npcInfo, index) => {
          return (
            <RBCard
              key={"card-" + index}
              bg={"light"}
              text={"dark"}
              style={{ width: "18rem" }}
              className="mb-2"
            >
              <RBCard.Header>{npcInfo.name}</RBCard.Header>
              <RBCard.Body>
                <div className="cardOptions">
                  <Button variant="danger" disabled={isLoading || battledNPCIds.has(npcInfo.name)}  onClick={() => battleNPC(npcInfo)}>Battle</Button>
                  <Button variant="primary" disabled={isLoading}  onClick={() => viewDeck(npcInfo)}>
                    View Deck
                  </Button>
                </div>
              </RBCard.Body>
            </RBCard>
          );
        })}
      </div>

      <div className="pageHeaderWrapper">
        <p className="pageHeader">Humans</p>
      </div>
      <div className="cardsContainer">
        <Button variant="success" disabled={isLoading || battledNPCIds.size < NPCS.length} onClick={onPlayRandom}>Play Random</Button>
        <Button variant="primary" disabled={isLoading || battledNPCIds.size < NPCS.length}  onClick={onJoinLobby}>
          Join Lobby
        </Button>
        <Button variant="warning" disabled={isLoading || battledNPCIds.size < NPCS.length}  onClick={onCreateLobby}>
          Create Lobby
        </Button>
      </div>

      <div className="pageHeaderWrapper">
        <p className="pageHeader">Your Games</p>
        {isLoading && (
          <Spinner
            style={{ marginLeft: "20px" }}
            animation="border"
            variant={"light"}
          />
        )}
        {rowSelected && (
          <div className="actionDropdownWrapper">
            <Dropdown>
              <Dropdown.Toggle disabled={isLoading} size="sm" variant="success" id="dropdown-basic">
                Actions
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {STATE_TO_ACTIONS[rowSelected.state].map(
                  (action: any, index: number) => {
                    const isPlayer1 = auth.user === rowSelected.player1_id;
                    let showAction = true;
                    if (
                      (isPlayer1 && rowSelected.state === "player2Turn") ||
                      (!isPlayer1 && rowSelected.state === "player1Turn")
                    ) {
                      showAction = false;
                    }

                    if (showAction) {
                      return (
                        <Dropdown.Item onClick={action.onClick}>
                          {action.name}
                        </Dropdown.Item>
                      );
                    } else {
                      return null;
                    }
                  }
                )}
                {/* <Dropdown.Item>No Available Actions</Dropdown.Item> */}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )}
      </div>
      <div className="cardsContainer" style={{ height: "100%" }}>
        <div
          className="ag-theme-alpine"
          style={{ height: "100%", width: "100%" }}
        >
          <AgGridReact
            pagination={true}
            paginationPageSize={50}
            rowData={rowData}
            rowSelection={"single"}
            defaultColDef={{
              sortable: true,
              resizable: true,
            }}
            headerHeight={30}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            enableCellTextSelection={true}
            onSelectionChanged={onSelectionChanged}
          ></AgGridReact>
        </div>
      </div>
    </div>
  );
}

export default Play;
