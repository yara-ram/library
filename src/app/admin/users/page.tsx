import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canManageUsers } from "@/lib/roles";
import UserRoleEditor from "@/components/UserRoleEditor";

export default async function UsersAdminPage() {
  const session = await requireSession();
  if (!session) redirect("/signin");

  // @ts-expect-error next-auth session typing augmentation handled in src/types
  const role = session.user?.role;
  if (!canManageUsers(role)) redirect("/unauthorized");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, take: 200 });

  return (
    <AppShell session={session}>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Manage roles and permissions. (Admins only)
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <div className="grid grid-cols-12 gap-3 border-b bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-600">
          <div className="col-span-5">User</div>
          <div className="col-span-5">Email</div>
          <div className="col-span-2 text-right">Role</div>
        </div>
        <ul className="divide-y">
          {users.map((u) => (
            <li key={u.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3">
              <div className="col-span-5 text-sm text-zinc-900">{u.name ?? "—"}</div>
              <div className="col-span-5 text-sm text-zinc-700">{u.email ?? "—"}</div>
              <div className="col-span-2 flex justify-end">
                <UserRoleEditor userId={u.id} currentRole={u.role} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

