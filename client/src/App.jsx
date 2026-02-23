import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { useAuth } from "./hooks/useAuth.js";
import Login from "./pages/Login.jsx";
import Books from "./pages/Books.jsx";
import BookForm from "./pages/BookForm.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";

function RequireAuth({ user, children }) {
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default function App() {
  const { loading, user } = useAuth();

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading…</div>;

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route
          path="/"
          element={
            <RequireAuth user={user}>
              <Books user={user} />
            </RequireAuth>
          }
        />
        <Route
          path="/books/new"
          element={
            <RequireAuth user={user}>
              <BookForm user={user} />
            </RequireAuth>
          }
        />
        <Route
          path="/books/:id/edit"
          element={
            <RequireAuth user={user}>
              <BookForm user={user} />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAuth user={user}>
              <AdminUsers />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
