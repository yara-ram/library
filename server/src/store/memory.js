const state = {
  nextUserId: 1,
  nextBookId: 1,
  usersById: new Map(),
  usersByProviderKey: new Map(),
  booksById: new Map()
};

function providerKey(provider, providerId) {
  return `${provider}:${providerId}`;
}

function nowIso() {
  return new Date().toISOString();
}

export async function upsertOAuthUser({ provider, providerId, email, name, adminEmails }) {
  const key = providerKey(provider, providerId);
  const existingId = state.usersByProviderKey.get(key);

  const normalizedEmail = email ? email.toLowerCase() : null;
  const isAdmin = normalizedEmail && adminEmails.includes(normalizedEmail);

  if (existingId) {
    const existing = state.usersById.get(existingId);
    const updated = {
      ...existing,
      email: normalizedEmail,
      name: name || existing.name || null
    };
    state.usersById.set(existingId, updated);
    return updated;
  }

  const user = {
    id: state.nextUserId++,
    provider,
    provider_id: providerId,
    email: normalizedEmail,
    name: name || null,
    role: isAdmin ? "admin" : "member",
    created_at: nowIso()
  };

  state.usersById.set(user.id, user);
  state.usersByProviderKey.set(key, user.id);
  return user;
}

export async function upsertDevUser({ email, name, role = "admin" }) {
  const normalizedEmail = (email || "").toLowerCase();
  return upsertOAuthUser({
    provider: "dev",
    providerId: normalizedEmail,
    email: normalizedEmail,
    name: name || normalizedEmail.split("@")[0] || "dev",
    adminEmails: role === "admin" ? [normalizedEmail] : []
  }).then((u) => ({ ...u, role }));
}

export async function getUserById(id) {
  return state.usersById.get(Number(id)) || null;
}

export async function listUsers() {
  return Array.from(state.usersById.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function setUserRole({ id, role }) {
  const user = state.usersById.get(Number(id));
  if (!user) return null;
  const updated = { ...user, role };
  state.usersById.set(Number(id), updated);
  return updated;
}

function enrichBorrower(book) {
  const borrower = book.checked_out_by ? state.usersById.get(book.checked_out_by) : null;
  return {
    ...book,
    borrower_id: borrower?.id ?? null,
    borrower_email: borrower?.email ?? null,
    borrower_name: borrower?.name ?? null
  };
}

export async function listBooks({ q }) {
  const all = Array.from(state.booksById.values())
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map(enrichBorrower);

  if (!q) return all;

  const needle = q.toLowerCase();
  return all.filter((b) => {
    const haystack = [
      b.title,
      b.author,
      b.isbn || "",
      b.genre || "",
      b.description || "",
      Array.isArray(b.tags) ? b.tags.join(" ") : ""
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export async function getBookById(id) {
  const book = state.booksById.get(Number(id));
  return book ? enrichBorrower(book) : null;
}

export async function createBook(book) {
  const createdAt = nowIso();
  const row = {
    id: state.nextBookId++,
    title: book.title,
    author: book.author,
    isbn: book.isbn || null,
    published_year: book.publishedYear ?? null,
    genre: book.genre || null,
    description: book.description || null,
    tags: book.tags || [],
    status: "available",
    checked_out_by: null,
    checked_out_at: null,
    due_at: null,
    created_at: createdAt,
    updated_at: createdAt
  };
  state.booksById.set(row.id, row);
  return row;
}

export async function updateBook(id, book) {
  const existing = state.booksById.get(Number(id));
  if (!existing) return null;
  const updated = {
    ...existing,
    title: book.title,
    author: book.author,
    isbn: book.isbn || null,
    published_year: book.publishedYear ?? null,
    genre: book.genre || null,
    description: book.description || null,
    tags: book.tags || [],
    updated_at: nowIso()
  };
  state.booksById.set(Number(id), updated);
  return updated;
}

export async function deleteBook(id) {
  state.booksById.delete(Number(id));
}

export async function checkoutBook({ id, userId, dueAt }) {
  const existing = state.booksById.get(Number(id));
  if (!existing) return null;
  if (existing.status !== "available") return null;

  const updated = {
    ...existing,
    status: "checked_out",
    checked_out_by: Number(userId),
    checked_out_at: nowIso(),
    due_at: dueAt || null,
    updated_at: nowIso()
  };
  state.booksById.set(Number(id), updated);
  return updated;
}

export async function checkinBook({ id }) {
  const existing = state.booksById.get(Number(id));
  if (!existing) return null;
  if (existing.status !== "checked_out") return null;

  const updated = {
    ...existing,
    status: "available",
    checked_out_by: null,
    checked_out_at: null,
    due_at: null,
    updated_at: nowIso()
  };
  state.booksById.set(Number(id), updated);
  return updated;
}

