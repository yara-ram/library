import Link from "next/link";
import type { Session } from "next-auth";
import SignOutButton from "@/components/SignOutButton";
import { canManageUsers } from "@/lib/roles";

export default function AppShell({
  session,
  children
}: {
  session: Session;
  children: React.ReactNode;
}) {
  // @ts-expect-error next-auth session typing augmentation handled in src/types
  const role = session.user?.role;

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold text-zinc-900">
              Mini Library
            </Link>
            <nav className="flex items-center gap-3 text-sm text-zinc-600">
              <Link href="/dashboard">Books</Link>
              <Link href="/ai">AI</Link>
              {canManageUsers(role) ? <Link href="/admin/users">Users</Link> : null}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-zinc-600">
              <div className="font-medium text-zinc-900">{session.user?.name}</div>
              <div>{session.user?.email}</div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

