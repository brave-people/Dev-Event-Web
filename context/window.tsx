import React, { createContext, ReactNode, useState } from 'react'

interface WindowContext {
  isClient: boolean;
  handleIsClient: (event: boolean) => void;
  windowX: number;
  handleWindowX: (event: number) => void;
}

const defaultValue: WindowContext = {
  isClient: false,
  handleIsClient: () => {},
  windowX: 0,
  handleWindowX: () => {}
}

const WindowContext = createContext(defaultValue);

const WindowProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [windowX, setWindowX] = useState<number>(0);

  const handleIsClient = (event: boolean) => {
    setIsClient(event);
  }
  const handleWindowX = (event: number) => {
    setWindowX(event);
  }

  const contextValue = {
    isClient,
    windowX,
    handleIsClient,
    handleWindowX
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