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
    deck: {
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
  const [playerGames, setPlayerGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const viewDeck = (npc: NPC) => {
    setSelectedNPC(npc);
    setShowDeckModal(true);
  };

  const handleCloseDeckModal = () => {
    setSelectedNPC(null);
    setShowDeckModal(false);
  };

  const onGridReady = (params: GridReadyEvent) => {
    params.api.showLoadingOverlay();
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  useEffect(() => {
    if (auth && !auth.isLoading && auth.user) {
      apiFetch(
        "player/games?player_id=" + auth.user,
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
    }
  }, [auth]);

  useEffect(() => {
    if (playerGames) {
      console.log(playerGames);
      gridApi?.setRowData(playerGames);
      setIsLoading(false);
      gridApi?.hideOverlay();
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
                  <Button variant="danger">Battle</Button>
                  <Button variant="primary" onClick={() => viewDeck(npcInfo)}>
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
        <Button variant="success">Play Random</Button>
        <Button variant="primary">Join Lobby</Button>
        <Button variant="warning">Create Lobby</Button>
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
            <Dropdown.Toggle size="sm" variant="success" id="dropdown-basic">
              Actions
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
              <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
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
