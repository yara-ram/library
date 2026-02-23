import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function Layout({ user, children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            Mini Library
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                classNames("rounded px-2 py-1", isActive ? "bg-slate-900 text-white" : "text-slate-700")
              }
            >
              Books
            </NavLink>
            {user?.role === "admin" ? (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  classNames("rounded px-2 py-1", isActive ? "bg-slate-900 text-white" : "text-slate-700")
                }
              >
                Users
              </NavLink>
            ) : null}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <div className="text-right">
                  <div className="font-medium text-slate-900">{user.name || user.email || "User"}</div>
                  <div className="text-xs text-slate-500">{user.role}</div>
                </div>
                <button
                  onClick={async () => {
                    await api.logout();
                    navigate("/login");
                  }}
                  className="rounded bg-slate-900 px-3 py-2 text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded bg-slate-900 px-3 py-2 text-white">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

