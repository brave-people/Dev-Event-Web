import React, { createContext, ReactNode, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'dev-event:theme';

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

// `windowTheme: true` = light, `false` = dark.
// Source of truth is the <html data-theme> attribute, which the inline script
// in _document.tsx sets BEFORE React boots (FOUC prevention). On mount we
// sync state from the attribute and re-apply it on every toggle.
const readInitialTheme = (): boolean => {
  if (typeof document === 'undefined') return true;
  return document.documentElement.getAttribute('data-theme') !== 'dark';
};

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

  useEffect(() => {
    setWindowTheme(readInitialTheme());

    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Only follow the system change when the user has not made an explicit choice.
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {}
      if (stored) return;
      const next = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      setWindowTheme(next === 'light');
    };
    mq.addEventListener?.('change', handleSystemChange);
    return () => mq.removeEventListener?.('change', handleSystemChange);
  }, []);

  const handleIsClient = (event: boolean) => {
    setIsClient(event);
  };
  const handleWindowX = (event: number) => {
    setWindowX(event);
  };

  const handleWindowTheme = (event: boolean) => {
    // `event` carries the desired NEXT theme (true = light, false = dark).
    setWindowTheme(event);
    if (typeof document !== 'undefined') {
      const themeName = event ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', themeName);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, themeName);
      } catch {}
    }
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
