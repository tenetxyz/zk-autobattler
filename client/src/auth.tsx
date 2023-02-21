import React, { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {Spinner} from "react-bootstrap";

const serverAuthProvider = {
  signIn(successCallback: any, errorCallback: any){
    // generate a random player id
    let playerId = Math.random().toString(36).substring(7);
    localStorage.setItem("playerId", playerId);
    successCallback(playerId);
  },
  isSignedIn(successCallback: any, errorCallback: any) {
    let playerId = localStorage.getItem("playerId");
    if (playerId) {
        successCallback(playerId);
    } else {
        errorCallback();
    }
  },
  signout(successCallback: any, errorCallback: any) {
    localStorage.removeItem("playerId");
    successCallback();
  },
};

export interface AuthContextType {
  user: any;
  isSignedIn: (successCallback: any, errorCallback: any) => void;
  signIn: (successCallback: any, errorCallback: any) => void;
  signout: (successCallback: any, errorCallback: any) => void;
  isLoading: boolean;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  let [user, setUser] = React.useState<any>(null);
  let [isLoading, setIsLoading] = React.useState<boolean>(true);

  useEffect(() => {
    // Sign in
    isSignedIn(
      (userAuthDetails: any) => {
        setUser(userAuthDetails);
        setIsLoading(false);
      },
      () => {
        // user not found
        setIsLoading(false);
      }
    );
  }, []);

  let isSignedIn = (successCallback: any, errorCallback: any) => {
    return serverAuthProvider.isSignedIn(successCallback, errorCallback);
  };

  let signout = (successCallback: any, errorCallback: any) => {
    return serverAuthProvider.signout(
      () => {
        setUser(null);
        successCallback();
      },
      () => {
        errorCallback();
      }
    );
  };

  let signIn = (successCallback: any, errorCallback: any) => {
    return serverAuthProvider.signIn((userAuthDetails:any) => {
      setUser(userAuthDetails);
      successCallback()
    }, errorCallback);
  };

  let value = { user, isSignedIn: isSignedIn, signout, isLoading, signIn  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return React.useContext(AuthContext);
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (auth.isLoading) {
    return (
      <div className="mainSpinner">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!auth.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function ForwardAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (auth.isLoading) {
    return <p></p>;
  }

  if (auth.user) {
    return <Navigate to="/deck" state={{ from: location }} replace />;
  }

  return children;
}

export { serverAuthProvider, RequireAuth, useAuth, AuthProvider, ForwardAuth };