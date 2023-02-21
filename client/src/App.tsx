import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

import "./App.scss";
import { useAuth } from "./auth";
import Decks from "./components/Decks";
import Study from "./components/Study";

import { Deck, UserData } from "./models";

// CSS

function PageNotFound() {
  return (
    <main style={{ padding: "1rem" }}>
      <p>There's nothing here!</p>
    </main>
  );
}

interface AppProps {}

function App(props: AppProps) {
  const auth = useAuth();
  let [userData, setUserData] = useState<UserData | null>(null);
  let [isLoading, setIsLoading] = useState<any>(true);

  useEffect(() => {
    if (auth && !auth.isLoading && auth.user) {
      let newUserData: UserData = {
        decks: [],
      }
      let playerDeckRaw: string | null = localStorage.getItem("playerDeck");
      if (playerDeckRaw) {
        let playerDeck: Deck = JSON.parse(playerDeckRaw);
        newUserData.decks.push(playerDeck);
      }
      setUserData(newUserData);
      setIsLoading(false);
    }
  }, [auth]);

  if (isLoading) {
    return (
      <div className="mainSpinner">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/deck" element={<Decks userData={userData} setUserData={setUserData} />} />
      <Route path="/study" element={<Study userData={userData} />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;