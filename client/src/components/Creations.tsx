import React, { useEffect, useState } from "react";
import { Card as RBCard, Form, Col, Row, Button, Modal } from "react-bootstrap";

// CSS
import "../styles/Creations.scss";
import { Card, Deck, UserData } from "../models";
import { useNavigate } from "react-router-dom";

interface CreationsProps {
  userData: UserData | null;
  saveUserData: any;
}

const DECK_TYPES = [
  {
    id: "BASIC_5",
    name: "Basic 5",
  },
  {
    id: "GRID_5",
    name: "Grid 5",
  },
];

function Creations(props: CreationsProps) {
  const [showCreateDeckModal, setShowCreateDeckModal] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const [deckName, setDeckName] = useState<string>("");
  const [deckType, setDeckType] = useState<string>("");

  const handleCloseCreateDeckModal = () => setShowCreateDeckModal(false);

  const createDeckClicked = () => {
    setShowCreateDeckModal(true);
  };

  const onNewDeckNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeckName(e.target.value);
  };

  const onNewDeckTypeSelected = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeckType(e.target.value);
  };

  const createNewDeck = () => {
    let newUserData: UserData | null = JSON.parse(
      JSON.stringify(props.userData)
    );
    let newDeck: Deck = {
      id: 0,
      name: deckName,
      type: deckType,
      cards: [],
    };
    if (newUserData == null) {
      newUserData = {
        decks: [],
      };
    }
    newDeck.id = newUserData.decks.length;
    newUserData.decks.push(newDeck);
    props.saveUserData(newUserData);
    setShowCreateDeckModal(false);
  };

  const editDeck = (deck: Deck) => {
    navigate('/deck', { state: { deck: deck } });
  }

  return (
    <div className="pageContainer">
      <Modal show={showCreateDeckModal} onHide={handleCloseCreateDeckModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create a Deck</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Deck Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="xyz"
                autoFocus
                value={deckName}
                onChange={onNewDeckNameChanged}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deck Type</Form.Label>
              <Form.Select onChange={onNewDeckTypeSelected}>
                <option value="">Pick a deck type</option>
                {DECK_TYPES.map((deckType) => {
                  return (
                    <option key={deckType.id} value={deckType.id}>
                      {deckType.name}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateDeckModal}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={deckName === "" || deckType === ""}
            onClick={createNewDeck}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="pageHeaderWrapper">
        <p className="pageHeader">Your Creations</p>
        <div className="cardButton">
          <Button variant="primary" onClick={createDeckClicked}>
            Create
          </Button>
        </div>
      </div>
      <div className="cardsContainer">
        {props.userData &&
          props.userData.decks.map((deck: Deck, index) => {
            return (
              <RBCard
                key={"deck-" + index}
                bg={"light"}
                text={"dark"}
                style={{ width: "18rem" }}
                className="mb-2"
              >
                <RBCard.Header>
                  {deck.name} ({deck.type})
                </RBCard.Header>
                <RBCard.Body>
                  <div className="cardOptions">
                    <Button variant="secondary" onClick={() => editDeck(deck)}>Edit</Button>
                  </div>
                </RBCard.Body>
              </RBCard>
            );
          })}
      </div>
    </div>
  );
}

export default Creations;
