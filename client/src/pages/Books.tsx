import React from "react";
import Modal from "../components/Modal";
import { apiFetch } from "../lib/api";
import type { Book } from "../lib/types";
import { useAuth } from "../lib/auth";

type BookFormState = Partial<Book> & { title: string; author: string };

function canManageBooks(role: string) {
  return role === "ADMIN";
}

function canCatalogAi(role: string) {
  return role === "ADMIN" || role === "STAFF";
}

export default function BooksPage() {
  const { user } = useAuth();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"" | "AVAILABLE" | "BORROWED">("");
  const [books, setBooks] = React.useState<Book[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Book | null>(null);
  const [form, setForm] = React.useState<BookFormState>({ title: "", author: "" });

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setToast(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      const data = await apiFetch<{ books: Book[] }>(`/books?${params.toString()}`);
      setBooks(data.books);
    } catch (e: any) {
      setToast(e?.message ?? "Failed to load books");
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", author: "", isbn: "", publisher: "", publishedYear: undefined, language: "", description: "", tags: "" });
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn ?? "",
      publisher: book.publisher ?? "",
      publishedYear: book.publishedYear ?? undefined,
      language: book.language ?? "",
      description: book.description ?? "",
      tags: book.tags ?? ""
    });
    setModalOpen(true);
  };

  async function saveBook() {
    setToast(null);
    try {
      if (editing) {
        await apiFetch<{ book: Book }>(`/books/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch<{ book: Book }>(`/books`, { method: "POST", body: JSON.stringify(form) });
      }
      setModalOpen(false);
      await refresh();
    } catch (e: any) {
      setToast(e?.message ?? "Save failed");
    }
  }

  async function deleteBook(bookId: string) {
    if (!confirm("Delete this book?")) return;
    setToast(null);
    try {
      await apiFetch<{ ok: boolean }>(`/books/${bookId}`, { method: "DELETE" });
      await refresh();
    } catch (e: any) {
      setToast(e?.message ?? "Delete failed");
    }
  }

  async function checkout(bookId: string) {
    setToast(null);
    try {
      await apiFetch<{ ok: boolean }>(`/books/${bookId}/checkout`, { method: "POST", body: JSON.stringify({}) });
      await refresh();
    } catch (e: any) {
      setToast(e?.message ?? "Checkout failed");
    }
  }

  async function checkin(bookId: string) {
    setToast(null);
    try {
      await apiFetch<{ ok: boolean }>(`/books/${bookId}/checkin`, { method: "POST", body: JSON.stringify({}) });
      await refresh();
    } catch (e: any) {
      setToast(e?.message ?? "Check-in failed");
    }
  }

  async function aiSuggestMetadata() {
    setToast(null);
    try {
      const data = await apiFetch<any>("/ai/book-metadata", {
        method: "POST",
        body: JSON.stringify({ title: form.title, author: form.author, isbn: form.isbn || undefined })
      });
      setForm((prev) => ({
        ...prev,
        description: data.description ?? prev.description,
        tags: data.tags ?? prev.tags,
        language: data.language ?? prev.language,
        publisher: data.publisher ?? prev.publisher,
        publishedYear: data.publishedYear ?? prev.publishedYear
      }));
      setToast(`AI suggestions applied (${data.source})`);
    } catch (e: any) {
      setToast(e?.message ?? "AI suggestion failed");
    }
  }

  return (
    <div className="panel">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <strong>Books</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            Search by title, author, ISBN, publisher, or tags.
          </div>
        </div>
        {user && canManageBooks(user.role) ? (
          <button className="btn primary" onClick={openCreate}>
            Add book
          </button>
        ) : null}
      </div>

      <div className="hr" />
      <div className="kvs">
        <div>
          <label>Search</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Tolkien, Clean Code, fantasy..." />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="">All</option>
            <option value="AVAILABLE">Available</option>
            <option value="BORROWED">Borrowed</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 10 }} className="row">
        <button className="btn" onClick={() => void refresh()} disabled={loading}>
          Refresh
        </button>
        {loading ? <span className="muted">Loading…</span> : <span className="muted">{books.length} book(s)</span>}
      </div>

      {toast ? <div className="toast">{toast}</div> : null}

      <div className="list">
        {books.map((b) => (
          <div key={b.id} className="book">
            <div>
              <div className="row" style={{ gap: 8 }}>
                <strong>{b.title}</strong>
                <span className={`pill ${b.status === "AVAILABLE" ? "ok" : "bad"}`}>{b.status}</span>
                {b.activeLoan?.borrower?.email ? <span className="pill">Borrower: {b.activeLoan.borrower.email}</span> : null}
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                {b.author}
                {b.isbn ? ` • ISBN: ${b.isbn}` : ""}
                {b.tags ? ` • ${b.tags}` : ""}
              </div>
            </div>
            <div className="row" style={{ justifyContent: "flex-end" }}>
              {b.status === "AVAILABLE" ? (
                <button className="btn" onClick={() => void checkout(b.id)}>
                  Check out
                </button>
              ) : (
                <button className="btn" onClick={() => void checkin(b.id)}>
                  Check in
                </button>
              )}
              {user && canManageBooks(user.role) ? (
                <>
                  <button className="btn" onClick={() => openEdit(b)}>
                    Edit
                  </button>
                  <button className="btn danger" onClick={() => void deleteBook(b.id)}>
                    Delete
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? "Edit book" : "Add book"}
        onClose={() => {
          setModalOpen(false);
          setToast(null);
        }}
      >
        <div className="kvs">
          <div>
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label>Author</label>
            <input value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} />
          </div>
          <div>
            <label>ISBN</label>
            <input value={(form.isbn as any) ?? ""} onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))} />
          </div>
          <div>
            <label>Publisher</label>
            <input
              value={(form.publisher as any) ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, publisher: e.target.value }))}
            />
          </div>
          <div>
            <label>Published year</label>
            <input
              type="number"
              value={form.publishedYear ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, publishedYear: e.target.value ? Number(e.target.value) : undefined }))}
            />
          </div>
          <div>
            <label>Language</label>
            <input value={(form.language as any) ?? ""} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Description</label>
          <textarea
            rows={4}
            value={(form.description as any) ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Tags (comma-separated)</label>
          <input value={(form.tags as any) ?? ""} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
          {user && canCatalogAi(user.role) ? (
            <button className="btn" onClick={() => void aiSuggestMetadata()}>
              AI: suggest metadata
            </button>
          ) : (
            <span className="muted" style={{ fontSize: 12 }}>
              AI cataloging requires STAFF/ADMIN.
            </span>
          )}
          <div className="row">
            <button className="btn primary" onClick={() => void saveBook()}>
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

