import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

function parseTags(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function BookForm({ user }) {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = Boolean(params.id);
  const isStaff = useMemo(() => ["admin", "librarian"].includes(user?.role), [user?.role]);

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    publishedYear: "",
    genre: "",
    description: "",
    tags: ""
  });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api
      .getBook(params.id)
      .then(({ book }) => {
        setForm({
          title: book.title || "",
          author: book.author || "",
          isbn: book.isbn || "",
          publishedYear: book.published_year || "",
          genre: book.genre || "",
          description: book.description || "",
          tags: Array.isArray(book.tags) ? book.tags.join(", ") : ""
        });
      })
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [isEdit, params.id]);

  if (!isStaff) {
    return (
      <div className="rounded border bg-white p-4 text-sm text-slate-700">
        Forbidden. <Link className="underline" to="/">Go back</Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{isEdit ? "Edit book" : "Add book"}</h1>
          <p className="mt-1 text-sm text-slate-600">Manage metadata and optionally use AI enrichment.</p>
        </div>
        <Link to="/" className="rounded border px-3 py-2 text-sm text-slate-700">
          Back
        </Link>
      </div>

      {loading ? <div className="mt-4 text-sm text-slate-600">Loading…</div> : null}
      {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

      <div className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Title</label>
          <input
            className="rounded border px-3 py-2 text-sm"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Author</label>
          <input
            className="rounded border px-3 py-2 text-sm"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">ISBN</label>
            <input
              className="rounded border px-3 py-2 text-sm"
              value={form.isbn}
              onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Year</label>
            <input
              className="rounded border px-3 py-2 text-sm"
              value={form.publishedYear}
              onChange={(e) => setForm((f) => ({ ...f, publishedYear: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Genre</label>
            <input
              className="rounded border px-3 py-2 text-sm"
              value={form.genre}
              onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="min-h-28 rounded border px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <input
            className="rounded border px-3 py-2 text-sm"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="rounded border px-4 py-2 text-sm text-slate-800"
            onClick={async () => {
              setError("");
              try {
                const data = await api.enrichBook({ title: form.title, author: form.author });
                const m = data.metadata || {};
                setForm((f) => ({
                  ...f,
                  genre: m.genre || f.genre,
                  description: m.description || f.description,
                  isbn: m.isbn || f.isbn,
                  publishedYear: m.publishedYear || f.publishedYear,
                  tags: Array.isArray(m.tags) && m.tags.length ? m.tags.join(", ") : f.tags
                }));
              } catch (e) {
                setError(e.message || "AI enrichment failed");
              }
            }}
          >
            Enrich with AI
          </button>

          <div className="flex gap-2">
            {isEdit ? (
              <button
                className="rounded bg-red-600 px-4 py-2 text-sm text-white"
                onClick={async () => {
                  if (!confirm("Delete this book?")) return;
                  await api.deleteBook(params.id);
                  navigate("/");
                }}
              >
                Delete
              </button>
            ) : null}
            <button
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
              onClick={async () => {
                setError("");
                try {
                  const payload = {
                    title: form.title,
                    author: form.author,
                    isbn: form.isbn || null,
                    publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
                    genre: form.genre || null,
                    description: form.description || null,
                    tags: parseTags(form.tags)
                  };
                  if (isEdit) await api.updateBook(params.id, payload);
                  else await api.createBook(payload);
                  navigate("/");
                } catch (e) {
                  setError(e.message || "Save failed");
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

