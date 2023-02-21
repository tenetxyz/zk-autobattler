import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./auth";

import Landing from "./Landing";
import App from "./App";
import Header from "./Header";

function Layout() {
  const [userData, setUserData] = useState<any>(null);

  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Header />
              <Landing />
            </div>
          }
        />
        <Route
          path="*"
          element={
            <RequireAuth>
              <div>
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