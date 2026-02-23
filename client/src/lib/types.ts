export type Role = "ADMIN" | "STAFF" | "MEMBER";

export type User = {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
};

export type BookStatus = "AVAILABLE" | "BORROWED";

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
  language?: string | null;
  description?: string | null;
  tags?: string | null;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
  activeLoan?: {
    id: string;
    checkedOutAt: string;
    borrower: { id: string; email: string; name?: string | null };
  } | null;
};

