"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_URL, apiFetch } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  loginUrl: string;
  setToken: (token: string) => void;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "yozaver_token";
const LEGACY_TOKEN_KEY = "typerush_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored =
        localStorage.getItem(TOKEN_KEY) ??
        localStorage.getItem(LEGACY_TOKEN_KEY);
      if (stored) {
        localStorage.setItem(TOKEN_KEY, stored);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
      }
    } catch {
      /* Practice remains available when browser storage is blocked. */
    }
    if (stored) {
      setTokenState(stored);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    apiFetch<AuthUser>("/auth/me", { signal: controller.signal }, token)
      .then((data) => {
        if (!controller.signal.aborted) setUser(data);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setTokenState(null);
        setUser(null);
        try {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(LEGACY_TOKEN_KEY);
        } catch {
          /* The in-memory session is still cleared. */
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, refreshTick]);

  const setToken = useCallback((newToken: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
    } catch {
      /* Use this session in memory. */
    }
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch {
      /* The in-memory session is still cleared. */
    }
    setTokenState(null);
    setUser(null);
  }, []);

  const refresh = useCallback(() => setRefreshTick((t) => t + 1), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginUrl: `${API_URL}/auth/google`,
        setToken,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
