import React, { useEffect, useState } from "react";
import { Card as RBCard, Form, Col, Row, Button } from "react-bootstrap";

// CSS
import "../styles/Decks.scss";
import { Card, Deck, UserData } from "../models";
import DeckView from "./DeckView";
import { useLocation, useNavigate } from "react-router-dom";

interface DecksProps {
  userData: UserData | null;
  saveUserData: any;
}

const PLACEHOLDER_DECKS: any = {
  BASIC_5: [
    {
      health: undefined,
      attack: undefined,
    },
    {
      health: undefined,
      attack: undefined,
    },
    {
      health: undefined,
      attack: undefined,
    },
    {
      health: undefined,
      attack: undefined,
    },
    {
      health: undefined,
      attack: undefined,
    }
  ]
}

function Decks(props: DecksProps) {
  const {state} = useLocation();
  const navigate = useNavigate();

  const [cards, setCards] = useState<Card[] | undefined>(() => {
    if(state && state.deck){
      if (state.deck.cards.length > 0) {
        return state.deck.cards;
      } else {
        return PLACEHOLDER_DECKS[state.deck.type];
      }
    } else {
      return undefined;
    }
  });

  const [modified, setModified] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string[]>(
    () => {
      if (cards){
        return Array(cards.length).fill("");
      } else {
        return [];
      }
    }
  );

  useEffect(() => {
    if (state == null || state.deck === undefined){
      navigate("/creations");
    }
  }, [])

  if (cards === undefined){
    return null;
  }

  const parseNumber = (value: string) => {
    let newValue = undefined;
    if (value !== "") {
      newValue = parseInt(value);
    }
    return newValue;
  };

  const onHealthValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseNumber(e.target.value);
    let cardId = parseInt(e.target.id.split("-")[2]);
    let newCards = [...cards];
    newCards[cardId].health = newValue;
    setCards(newCards);
    setModified(true);
    let newErrorMsgs = [...errorMsg];
    newErrorMsgs[cardId] = "";
    setErrorMsg(newErrorMsgs);
  };

  const onAttackValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseNumber(e.target.value);
    let cardId = parseInt(e.target.id.split("-")[2]);
    let newCards = [...cards];
    newCards[cardId].attack = newValue;
    setCards(newCards);
    setModified(true);
    let newErrorMsgs = [...errorMsg];
    newErrorMsgs[cardId] = "";
    setErrorMsg(newErrorMsgs);
  };

  const validateCards = (cards: Card[]) => {
    let isValid = true;
    let newErrorMsgs = [...errorMsg];
    cards.forEach((card, index) => {
      if (card.health === undefined || card.attack === undefined) {
        newErrorMsgs[index] = "All cards must have a health and attack value.";
        isValid = false;
      } else {
        if (card.health === 0) {
          newErrorMsgs[index] = "A card's health cannot be 0.";
          isValid = false;
        }
        let sum = card.health + card.attack;
        if (sum !== 10) {
          newErrorMsgs[index] =
            "The sum of a card's health and attack must equal 10.";
          isValid = false;
        }
      }
    });
    setErrorMsg(newErrorMsgs);
    return isValid;
  };

  const saveCardClicked = () => {
    if (validateCards(cards)) {
      let newUserData: UserData | null = JSON.parse(
        JSON.stringify(props.userData)
      );
      if(newUserData){
        let newDeck = newUserData.decks.find((deck) => deck.id === state.deck.id);
        if(newDeck){
          newDeck.cards = cards;
          props.saveUserData(newUserData);
          setModified(false);
        }
      }
    }
  };

  return (
    <div className="pageContainer">
      <div className="pageHeaderWrapper">
        <p className="pageHeader">Your Deck</p>
        {modified && (
          <div className="cardButton">
            <Button variant="primary" onClick={saveCardClicked}>
              Save
            </Button>
          </div>
        )}
      </div>
      <DeckView
        cards={cards}
        onHealthValueChange={onHealthValueChange}
        onAttackValueChange={onAttackValueChange}
        disabled={false}
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default Decks;
