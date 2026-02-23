const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;
  if (!response.ok) {
    const error = payload?.error || response.statusText;
    const details = payload?.details;
    const err = new Error(error);
    err.status = response.status;
    err.details = details;
    throw err;
  }
  return payload;
}

export const api = {
  me: () => request("/auth/me"),
  signup: ({ email, password, name }) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password, name }) }),
  login: ({ email, password }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/auth/logout", { method: "POST", body: JSON.stringify({}) }),

  listBooks: (q) => request(`/api/books${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  getBook: (id) => request(`/api/books/${id}`),
  createBook: (book) => request("/api/books", { method: "POST", body: JSON.stringify(book) }),
  updateBook: (id, book) => request(`/api/books/${id}`, { method: "PUT", body: JSON.stringify(book) }),
  deleteBook: (id) => request(`/api/books/${id}`, { method: "DELETE" }),
  checkoutBook: (id, dueAt) =>
    request(`/api/books/${id}/checkout`, { method: "POST", body: JSON.stringify({ dueAt }) }),
  checkinBook: (id) => request(`/api/books/${id}/checkin`, { method: "POST", body: JSON.stringify({}) }),

  enrichBook: ({ title, author }) =>
    request("/api/ai/enrich", { method: "POST", body: JSON.stringify({ title, author }) }),

  listUsers: () => request("/api/users"),
  setUserRole: (id, role) => request(`/api/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) })
};
