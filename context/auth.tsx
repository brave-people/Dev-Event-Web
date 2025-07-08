import React, { createContext, ReactNode, useState, useEffect } from 'react';

interface AuthContext {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const defaultValue: AuthContext = {
  isLoggedIn: false,
  login: () => {},
  logout: async () => {},
};

const AuthContext = createContext(defaultValue);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // 페이지 로드 시 로그인 상태 확인
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/checkAuth', {
          method: 'GET',
          credentials: 'include', // 쿠키 포함
        });
        
        if (response.ok) {
          const data = await response.json();
          setLoggedIn(data.isLoggedIn);
        } else {
          setLoggedIn(false);
        }
      } catch (error) {
        console.error('로그인 상태 확인 오류:', error);
        setLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = () => {
    setLoggedIn(true);
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setLoggedIn(false);
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 오류가 발생해도 클라이언트 상태는 업데이트
      setLoggedIn(false);
    }
  };

  const contextValue = {
    isLoggedIn,
    login,
    logout,
  };
  return (
    <>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </>
  );
};

export { AuthContext, AuthProvider };
