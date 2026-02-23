import React from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import BooksPage from "./pages/Books";
import SignIn from "./pages/SignIn";
import AiAssistantPage from "./pages/AiAssistant";
import AdminUsersPage from "./pages/AdminUsers";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container">Loading…</div>;
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <strong>Mini Library</strong>
          <span className="muted">{user ? `${user.email} • ${user.role}` : "Not signed in"}</span>
        </div>
        <div className="nav">
          <Link className="btn" to="/">
            Books
          </Link>
          <Link className="btn" to="/ai">
            AI
          </Link>
          {user?.role === "ADMIN" ? (
            <Link className="btn" to="/admin/users">
              Users
            </Link>
          ) : null}
          {user ? (
            <button className="btn danger" onClick={() => void logout()}>
              Sign out
            </button>
          ) : (
            <Link className="btn primary" to="/signin">
              Sign in
            </Link>
          )}
        </div>
      </div>
      <div className="grid">
        <div>{children}</div>
        <div className="panel">
          <strong>Quick tips</strong>
          <div className="hr" />
          <div className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
            <div>
              - <span className="pill ok">AVAILABLE</span> can be checked out by any authenticated user.
            </div>
            <div style={{ marginTop: 8 }}>
              - Only <span className="pill">ADMIN</span> can add/edit/delete books and manage user roles.
            </div>
            <div style={{ marginTop: 8 }}>
              - <span className="pill">STAFF/ADMIN</span> can use AI metadata suggestions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AppShell>
                <Routes>
                  <Route path="/" element={<BooksPage />} />
                  <Route path="/ai" element={<AiAssistantPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

