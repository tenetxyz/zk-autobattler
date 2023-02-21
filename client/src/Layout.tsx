import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./auth";

import Landing from "./Landing";
import App from "./App";
import Header from "./Header";

import "./Layout.scss";

function Layout() {
  const [userData, setUserData] = useState<any>(null);

  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <div className="layoutWrapper">
              <Header />
              <Landing />
            </div>
          }
        />
        <Route
          path="*"
          element={
            <RequireAuth>
              <div className="layoutWrapper">
                <Header />
                <App />
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default Layout;