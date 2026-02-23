import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700"
  };
  return <span className={`rounded px-2 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export default function Books({ user }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");

  const isStaff = useMemo(() => ["admin", "librarian"].includes(user?.role), [user?.role]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listBooks(q.trim());
      setBooks(data.books);
    } catch (e) {
      setError(e.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, author, ISBN, genre…"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <button onClick={load} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
            Search
          </button>
        </div>
        {isStaff ? (
          <Link to="/books/new" className="rounded bg-blue-600 px-3 py-2 text-center text-sm text-white">
            Add book
          </Link>
        ) : null}
      </div>

      {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}
      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="grid gap-3">
        {books.map((b) => {
          const available = b.status === "available";
          const canReturn =
            b.status === "checked_out" && (Number(b.checked_out_by) === Number(user.id) || isStaff);
          return (
            <div key={b.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-slate-900">{b.title}</div>
                  <div className="mt-1 text-sm text-slate-700">{b.author}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {available ? <Badge tone="green">Available</Badge> : <Badge tone="amber">Checked out</Badge>}
                    {b.genre ? <Badge>{b.genre}</Badge> : null}
                    {b.published_year ? <Badge>{b.published_year}</Badge> : null}
                    {b.isbn ? <Badge>ISBN {b.isbn}</Badge> : null}
                  </div>
                  {!available ? (
                    <div className="mt-2 text-xs text-slate-600">
                      Borrower: {b.borrower_name || b.borrower_email || "Unknown"}
                      {b.due_at ? ` · Due ${new Date(b.due_at).toLocaleDateString()}` : ""}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  {available ? (
                    <button
                      className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                      onClick={async () => {
                        await api.checkoutBook(b.id);
                        load();
                      }}
                    >
                      Check out
                    </button>
                  ) : canReturn ? (
                    <button
                      className="rounded bg-slate-700 px-3 py-2 text-sm text-white"
                      onClick={async () => {
                        await api.checkinBook(b.id);
                        load();
                      }}
                    >
                      Check in
                    </button>
                  ) : null}

                  {isStaff ? (
                    <Link
                      className="rounded border px-3 py-2 text-center text-sm text-slate-700"
                      to={`/books/${b.id}/edit`}
                    >
                      Edit
                    </Link>
                  ) : null}
                </div>
              </div>
              {b.description ? <p className="mt-3 text-sm text-slate-700">{b.description}</p> : null}
              {Array.isArray(b.tags) && b.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {!loading && books.length === 0 ? <div className="text-sm text-slate-600">No books found.</div> : null}
      </div>
    </div>
  );
}

