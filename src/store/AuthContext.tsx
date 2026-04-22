import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthState {
  username?: string;
  password?: string;
  role?: 'ADMIN' | 'SELLER' | null;
}

interface AuthContextType extends AuthState {
  setAuth: (auth: AuthState) => void;
  clearAuth: () => void;
  getBasicAuthHeader: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuthState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem('sellerinsight_auth');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const setAuth = (newAuth: AuthState) => {
    setAuthState(newAuth);
    localStorage.setItem('sellerinsight_auth', JSON.stringify(newAuth));
  };

  const clearAuth = () => {
    setAuthState({});
    localStorage.removeItem('sellerinsight_auth');
  };

  const getBasicAuthHeader = () => {
    if (auth.username && auth.password) {
      return `Basic ${btoa(`${auth.username}:${auth.password}`)}`;
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, clearAuth, getBasicAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
