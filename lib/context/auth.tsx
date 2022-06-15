import React, { createContext, ReactNode, useState } from 'react';

interface AuthContext {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const defaultValue: AuthContext = {
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext(defaultValue);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const login = () => {
    setLoggedIn(true);
  };

  const logout = () => {
    setLoggedIn(false);
  };

  const contextValue = {
    isLoggedIn,
    login,
    logout,
  };
  return (
    <>
      <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    </>
  );
};

export { AuthContext, AuthProvider };
