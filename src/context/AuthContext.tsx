import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { User } from "@/lib/types";
import * as authService from "@/services/auth";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(authService.readStoredUser());
    setIsReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const next = await authService.login(email, password);
    authService.persistUser(next);
    setUser(next);
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    const next = await authService.signup(name, email);
    authService.persistUser(next);
    setUser(next);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    authService.persistUser(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), isReady, login, signup, logout }),
    [user, isReady, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
