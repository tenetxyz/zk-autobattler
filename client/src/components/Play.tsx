import React, { useEffect, useState } from "react";
import { ForwardAuth, useAuth } from "../auth";
import { Deck, NPC, UserData } from "../models";
import { Card as RBCard, Form, Col, Row, Button, Modal } from "react-bootstrap";
import { apiFetch } from "../utils";

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
      ]
    },
  },
];

function Play(props: PlayProps) {
  const auth = useAuth();
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [showDeckModal, setShowDeckModal] = useState(false);

  const viewDeck = (npc: NPC) => {
    setSelectedNPC(npc);
    setShowDeckModal(true);
  };

  const handleCloseDeckModal = () => {
    setSelectedNPC(null);
    setShowDeckModal(false);
  }

  return (
    <div className="pageContainer">
      <Modal show={showDeckModal} onHide={handleCloseDeckModal} dialogClassName="deckViewModal">
        <Modal.Header closeButton>
          <Modal.Title>NPC {selectedNPC?.name} Deck</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNPC &&
             <DeckView
             cards={selectedNPC.deck.cards}
             onHealthValueChange={undefined}
             onAttackValueChange={undefined}
             disabled={true}
             errorMsg={undefined}
           />
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeckModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="pageHeaderWrapper">
        <p className="pageHeader">NPCs</p>
        {/* {isLoading && <Spinner style={{marginLeft: "20px"}} animation="border" variant={"light"} />} */}
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
                  <Button
                    variant="primary"
                    onClick={() => viewDeck(npcInfo)}
                  >
                    View Deck
                  </Button>
                </div>
              </RBCard.Body>
            </RBCard>
          );
        })}
      </div>
    </div>
  );
}

export default Play;
