import React, { createContext, ReactNode, useState } from 'react'

interface WindowContext {
  isClient: boolean;
  handleIsClient: (event: boolean) => void;
  windowX: number;
  handleWindowX: (event: number) => void;
  windowTheme: boolean;
  handleWindowTheme: (event: boolean) => void;
}

const defaultValue: WindowContext = {
  isClient: false,
  handleIsClient: () => {},
  windowX: 0,
  handleWindowX: () => {},
  windowTheme: true,
  handleWindowTheme: () => {}
}

const WindowContext = createContext(defaultValue);

const WindowProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [windowX, setWindowX] = useState<number>(0);
  const [windowTheme, setWindowTheme] = useState<boolean>(true);

  const handleIsClient = (event: boolean) => {
    setIsClient(event);
  }
  const handleWindowX = (event: number) => {
    setWindowX(event);
  }

  const handleWindowTheme = (event: boolean) => {
    setWindowTheme(!event);
  }

  const contextValue = {
    isClient,
    windowX,
    windowTheme,
    handleIsClient,
    handleWindowX,
    handleWindowTheme
  }
  return (
    <>
      <WindowContext.Provider value={contextValue}>
        {children}
      </WindowContext.Provider>
    </>
  )
}

export {
  WindowContext,
  WindowProvider
}