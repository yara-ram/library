import React from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function SignIn() {
  const { sso, devLogin } = useAuth();
  const [providers, setProviders] = React.useState<{ github: boolean; google: boolean } | null>(null);
  const [email, setEmail] = React.useState("admin@demo.local");
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      try {
        const data = await apiFetch<{ github: boolean; google: boolean }>("/auth/providers");
        setProviders(data);
      } catch {
        setProviders({ github: false, google: false });
      }
    })();
  }, []);

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Sign in</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          Use SSO (preferred) or the dev login for local testing.
        </p>

        <div className="row">
          <button className="btn primary" disabled={!providers?.github} onClick={() => sso("github")}>
            Continue with GitHub
          </button>
          <button className="btn primary" disabled={!providers?.google} onClick={() => sso("google")}>
            Continue with Google
          </button>
        </div>

        <div className="hr" />
        <h3 style={{ margin: 0, fontSize: 14 }}>Dev login (local only)</h3>
        <div className="kvs" style={{ marginTop: 10 }}>
          <div>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@demo.local" />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button
              className="btn"
              onClick={async () => {
                setToast(null);
                try {
                  await devLogin(email);
                } catch (e: any) {
                  setToast(e?.message ?? "Login failed");
                }
              }}
            >
              Sign in as seeded user
            </button>
          </div>
        </div>

        {toast ? <div className="toast">{toast}</div> : null}

        <div className="hr" />
        <p className="muted" style={{ marginBottom: 0 }}>
          Seeded users: <code>admin@demo.local</code>, <code>staff@demo.local</code>, <code>member@demo.local</code>
        </p>
      </div>
    </div>
  );
}

