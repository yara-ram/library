import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function Layout({ user, children }) {
  const navigate = useNavigate();
  const isStaff = Boolean(user);

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="border-b bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Mini Library
          </Link>
        </div>

        <nav className="grid gap-2 px-3 pb-4 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              classNames("rounded px-3 py-2", isActive ? "bg-slate-900 text-white" : "text-slate-700")
            }
          >
            Books
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              classNames("rounded px-3 py-2", isActive ? "bg-slate-900 text-white" : "text-slate-700")
            }
          >
            Users
          </NavLink>

          {isStaff ? (
            <Link to="/books/new" className="rounded bg-blue-600 px-3 py-2 text-center text-white">
              Add book
            </Link>
          ) : null}
        </nav>

        <div className="border-t px-4 py-4 text-sm">
          {user ? (
            <div className="grid gap-3">
              <div>
                <div className="font-medium text-slate-900">{user.name || user.email || "User"}</div>
                <div className="text-xs text-slate-500">member</div>
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
            </div>
          ) : (
            <Link to="/login" className="rounded bg-slate-900 px-3 py-2 text-white">
              Login
            </Link>
          )}
        </div>
      </aside>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:max-w-none">{children}</main>
    </div>
  );
}

