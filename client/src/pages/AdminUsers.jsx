import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listUsers();
      setUsers(data.users);
    } catch (e) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-lg border bg-white p-6">
      <h1 className="text-xl font-semibold text-slate-900">Users</h1>
      <p className="mt-1 text-sm text-slate-600">Admin-only: manage roles and permissions.</p>

      {loading ? <div className="mt-4 text-sm text-slate-600">Loading…</div> : null}
      {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

      <div className="mt-4 grid gap-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3 rounded border p-3">
            <div>
              <div className="text-sm font-medium text-slate-900">{u.name || u.email || `User ${u.id}`}</div>
              <div className="text-xs text-slate-600">{u.email || "No email"}</div>
            </div>
            <div className="rounded border px-3 py-2 text-sm text-slate-700">member</div>
          </div>
        ))}
        {!loading && users.length === 0 ? <div className="text-sm text-slate-600">No users.</div> : null}
      </div>
    </div>
  );
}

