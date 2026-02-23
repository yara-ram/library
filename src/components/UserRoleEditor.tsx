"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { setUserRole } from "@/lib/userActions";

export default function UserRoleEditor({
  userId,
  currentRole
}: {
  userId: string;
  currentRole: Role;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      disabled={isPending}
      value={currentRole}
      onChange={(e) => {
        const nextRole = e.target.value as Role;
        startTransition(async () => {
          await setUserRole(userId, nextRole);
          router.refresh();
        });
      }}
      className="rounded-xl border bg-white px-3 py-1.5 text-sm disabled:opacity-50"
    >
      <option value="ADMIN">ADMIN</option>
      <option value="LIBRARIAN">LIBRARIAN</option>
      <option value="MEMBER">MEMBER</option>
    </select>
  );
}

