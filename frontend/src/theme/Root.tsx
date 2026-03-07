import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../utils/api';
import ChatWidget from '../components/ChatWidget';

/**
 * User interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Auth Context interface
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isLoggedIn: () => boolean;
}

/**
 * Auth Context
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Page Content Context for swapping English with AI content
 */
interface PageContentContextType {
  swappedContent: string | null;
  setSwappedContent: (content: string | null) => void;
}

export const PageContentContext = createContext<PageContentContextType | null>(null);

export const usePageContent = (): PageContentContextType => {
  const context = useContext(PageContentContext);
  if (!context) {
    throw new Error('usePageContent must be used within PageContentProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 */
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [swappedContent, setSwappedContent] = useState<string | null>(null);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      // Verify token is still valid
      apiFetch('/auth/me', {}, true)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Token invalid');
        })
        .then((data) => {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  /**
   * Logout user
   */
  const logout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    window.location.href = '/physical-ai-book/';
  };

  /**
   * Check if user is logged in
   */
  const isLoggedIn = (): boolean => {
    return !!token && !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isLoggedIn,
      }}
    >
      <PageContentContext.Provider value={{ swappedContent, setSwappedContent }}>
        {children}
      </PageContentContext.Provider>
    </AuthContext.Provider>
  );
}

/**
 * Root component wrapped with AuthProvider
 * This is the entry point for Docusaurus
 */
export default function Root({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <AuthProvider>
      {children}
      <ChatWidget />
    </AuthProvider>
  );
}
