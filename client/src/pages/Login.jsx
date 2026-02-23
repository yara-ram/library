import { useState } from "react";
import { api } from "../api";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function Login({ devLoginEnabled }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="mx-auto max-w-md rounded-lg border bg-white p-6">
      <h1 className="text-xl font-semibold text-slate-900">Login</h1>
      <p className="mt-1 text-sm text-slate-600">Use SSO to access the library system.</p>

      <div className="mt-6 grid gap-3">
        <a className="rounded bg-blue-600 px-4 py-2 text-center text-white" href={`${API_BASE}/auth/google`}>
          Continue with Google
        </a>
        <a className="rounded bg-slate-900 px-4 py-2 text-center text-white" href={`${API_BASE}/auth/github`}>
          Continue with GitHub
        </a>
      </div>

      {devLoginEnabled ? (
        <>
          <div className="mt-6 border-t pt-4">
            <h2 className="text-sm font-semibold text-slate-900">Dev login</h2>
            <p className="mt-1 text-xs text-slate-600">Only for local development.</p>
            <div className="mt-3 flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded border px-3 py-2 text-sm"
              />
              <button
                className="rounded bg-slate-700 px-3 py-2 text-sm text-white"
                onClick={async () => {
                  setError("");
                  try {
                    await api.devLogin(email);
                    window.location.href = "/";
                  } catch (e) {
                    setError(e.message || "Login failed");
                  }
                }}
              >
                Login
              </button>
            </div>
            {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

