import { useMemo, useState } from "react";
import { api } from "../api";

function Tabs({ mode, setMode }) {
  const tabBase = "rounded px-3 py-2 text-sm";
  const active = "bg-slate-900 text-white";
  const inactive = "bg-slate-100 text-slate-800";

  return (
    <div className="flex gap-2">
      <button className={`${tabBase} ${mode === "login" ? active : inactive}`} onClick={() => setMode("login")}>
        Login
      </button>
      <button className={`${tabBase} ${mode === "signup" ? active : inactive}`} onClick={() => setMode("signup")}>
        Sign up
      </button>
    </div>
  );
}

export default function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Login" : "Create account"), [mode]);

  return (
    <div className="mx-auto max-w-md rounded-lg border bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">Local authentication (email + password).</p>
        </div>
        <Tabs mode={mode} setMode={setMode} />
      </div>

      <div className="mt-6 grid gap-3">
        {mode === "signup" ? (
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Jane Doe"
            />
          </div>
        ) : null}

        <div className="grid gap-2">
          <label className="text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="At least 8 characters"
            type="password"
          />
        </div>

        <button
          className="rounded bg-slate-900 px-4 py-2 text-center text-white disabled:opacity-60"
          disabled={loading}
          onClick={async () => {
            setError("");
            setLoading(true);
            try {
              if (mode === "login") {
                await api.login({ email, password });
              } else {
                await api.signup({ email, password, name: name || undefined });
              }
              window.location.href = "/";
            } catch (e) {
              setError(e.message || "Auth failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          {mode === "login" ? "Login" : "Sign up"}
        </button>
      </div>
      {error ? <div className="mt-3 text-xs text-red-600">{error}</div> : null}
    </div>
  );
}
