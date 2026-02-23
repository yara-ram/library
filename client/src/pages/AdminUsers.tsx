import React from "react";
import { apiFetch } from "../lib/api";
import type { Role, User } from "../lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setToast(null);
    try {
      const data = await apiFetch<{ users: User[] }>("/admin/users");
      setUsers(data.users);
    } catch (e: any) {
      setToast(e?.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function setRole(userId: string, role: Role) {
    setToast(null);
    try {
      await apiFetch<{ user: User }>(`/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
      await refresh();
    } catch (e: any) {
      setToast(e?.message ?? "Failed to update role");
    }
  }

  return (
    <div className="panel">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <strong>Users</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            Admin-only role management.
          </div>
        </div>
        <button className="btn" onClick={() => void refresh()} disabled={loading}>
          Refresh
        </button>
      </div>
      {toast ? <div className="toast">{toast}</div> : null}
      <div className="list">
        {users.map((u) => (
          <div key={u.id} className="book" style={{ gridTemplateColumns: "1fr auto" }}>
            <div>
              <strong>{u.email}</strong>
              <div className="muted" style={{ marginTop: 6 }}>
                {u.name ? `${u.name} • ` : ""}
                Role: {u.role}
              </div>
            </div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <select value={u.role} onChange={(e) => void setRole(u.id, e.target.value as Role)} style={{ width: 160 }}>
                <option value="ADMIN">ADMIN</option>
                <option value="STAFF">STAFF</option>
                <option value="MEMBER">MEMBER</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

