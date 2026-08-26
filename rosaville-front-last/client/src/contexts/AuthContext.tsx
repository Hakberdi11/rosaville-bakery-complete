import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, CustomerUser } from '@/lib/api';

interface AuthContextValue {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  checkUserAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkUserAuth = async () => {
    if (!api.auth.isAuthenticated()) {
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }
    try {
      setIsLoadingAuth(true);
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkUserAuth();
  }, []);

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, checkUserAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
