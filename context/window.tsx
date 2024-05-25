import React, { createContext, ReactNode, useState } from 'react';

type ModalStateProps = {
  currentModal: number;
  prevModal: number;
  type: boolean;
};

interface WindowContext {
  isClient: boolean;
  handleIsClient: (event: boolean) => void;
  windowX: number;
  handleWindowX: (event: number) => void;
  windowTheme: boolean;
  handleWindowTheme: (event: boolean) => void;
  isNotice: boolean;
  handleIsNotice: (event: boolean) => void;
  modalState: ModalStateProps;
  handleModalState: (event: ModalStateProps) => void;
}

const defaultValue: WindowContext = {
  isClient: false,
  handleIsClient: () => {},
  windowX: 0,
  handleWindowX: () => {},
  windowTheme: true,
  handleWindowTheme: () => {},
  isNotice: true,
  handleIsNotice: () => {},
  modalState: {
    currentModal: 0,
    prevModal: 0,
    type: false,
  },
  handleModalState: () => {},
};

const WindowContext = createContext(defaultValue);

const WindowProvider = ({ children }: { children: ReactNode }) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [windowX, setWindowX] = useState<number>(0);
  const [windowTheme, setWindowTheme] = useState<boolean>(true);
  const [isNotice, setIsNotice] = useState<boolean>(true);
  const [modalState, setModalState] = useState<ModalStateProps>(
    defaultValue.modalState
  );

  const handleIsClient = (event: boolean) => {
    setIsClient(event);
  };
  const handleWindowX = (event: number) => {
    setWindowX(event);
  };

  const handleWindowTheme = (event: boolean) => {
    setWindowTheme(!event);
  };

  const handleIsNotice = (event: boolean) => {
    setIsNotice(event);
  };

  const handleModalState = (event: ModalStateProps) => {
    setModalState(event);
  };

  const contextValue = {
    isClient,
    windowX,
    windowTheme,
    isNotice,
    handleIsClient,
    handleWindowX,
    handleWindowTheme,
    handleIsNotice,
    modalState,
    handleModalState,
  };
  return (
    <>
      <WindowContext.Provider value={contextValue}>
        {children}
      </WindowContext.Provider>
    </>
  );
};

export { WindowContext, WindowProvider };
