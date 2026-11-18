import React, { createContext, ReactNode, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'dev-event:theme';

interface WindowContext {
  windowTheme: boolean;
  handleWindowTheme: (event: boolean) => void;
  isNotice: boolean;
  handleIsNotice: (event: boolean) => void;
}

// `windowTheme: true` = light, `false` = dark.
// Source of truth is the <html data-theme> attribute, which the inline script
// in _document.tsx sets BEFORE React boots (FOUC prevention). On mount we
// sync state from the attribute and re-apply it on every toggle.
const readInitialTheme = (): boolean => {
  if (typeof document === 'undefined') return true;
  return document.documentElement.getAttribute('data-theme') !== 'dark';
};

// Provider 밖에서 부르면 아무것도 하지 않는다
const noop = (): void => undefined;

const defaultValue: WindowContext = {
  windowTheme: true,
  handleWindowTheme: noop,
  isNotice: true,
  handleIsNotice: noop,
};

const WindowContext = createContext(defaultValue);

const WindowProvider = ({ children }: { children: ReactNode }) => {
  const [windowTheme, setWindowTheme] = useState<boolean>(true);
  const [isNotice, setIsNotice] = useState<boolean>(true);

  useEffect(() => {
    setWindowTheme(readInitialTheme());

    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Only follow the system change when the user has not made an explicit choice.
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        // 저장소를 못 읽으면(사생활 보호 모드 등) 고른 적 없는 것으로 보고 시스템 설정을 따른다
      }
      if (stored) return;
      const next = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      setWindowTheme(next === 'light');
    };
    mq.addEventListener?.('change', handleSystemChange);
    return () => mq.removeEventListener?.('change', handleSystemChange);
  }, []);

  const handleWindowTheme = (event: boolean) => {
    // `event` carries the desired NEXT theme (true = light, false = dark).
    setWindowTheme(event);
    if (typeof document !== 'undefined') {
      const themeName = event ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', themeName);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, themeName);
      } catch {
        // 저장하지 못하면 이번 방문에만 적용된다
      }
    }
  };

  const handleIsNotice = (event: boolean) => {
    setIsNotice(event);
  };

  const contextValue = {
    windowTheme,
    isNotice,
    handleWindowTheme,
    handleIsNotice,
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
