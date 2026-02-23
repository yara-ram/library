import React from "react";
import { apiFetch } from "../lib/api";

export default function AiAssistantPage() {
  const [message, setMessage] = React.useState("Recommend fantasy books");
  const [reply, setReply] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  async function ask() {
    setLoading(true);
    setToast(null);
    try {
      const data = await apiFetch<{ reply: string; source: string }>("/ai/assistant", {
        method: "POST",
        body: JSON.stringify({ message })
      });
      setReply(data.reply);
      setSource(data.source);
    } catch (e: any) {
      setToast(e?.message ?? "Failed to ask");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <strong>AI Assistant</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            Optional: uses OpenAI if configured; otherwise a simple fallback.
          </div>
        </div>
        <button className="btn" onClick={() => void ask()} disabled={loading}>
          Ask
        </button>
      </div>
      <div className="hr" />
      <label>Your message</label>
      <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
      {toast ? <div className="toast">{toast}</div> : null}
      {reply ? (
        <div className="toast">
          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
            Source: {source}
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{reply}</div>
        </div>
      ) : null}
    </div>
  );
}

