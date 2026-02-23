import React from "react";
import { apiFetch, API_BASE_URL } from "./api";
import type { User } from "./types";

type AuthState = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  sso: (provider: "github" | "google") => void;
  devLogin: (email: string) => Promise<void>;
};

const AuthContext = React.createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = React.useCallback(async () => {
    await apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST", body: JSON.stringify({}) });
    setUser(null);
  }, []);

  const sso = React.useCallback((provider: "github" | "google") => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  }, []);

  const devLogin = React.useCallback(async (email: string) => {
    const data = await apiFetch<{ ok: boolean; user: User }>("/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    if (data.ok) setUser(data.user);
  }, []);

  return <AuthContext.Provider value={{ user, loading, refresh, logout, sso, devLogin }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

