"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canManageUsers } from "@/lib/roles";
import type { Role } from "@prisma/client";

function getRoleFromSession(session: any) {
  return session?.user?.role;
}

export async function setUserRole(userId: string, role: Role) {
  const session = await requireSession();
  if (!session) redirect("/signin");
  const actorRole = getRoleFromSession(session);
  if (!canManageUsers(actorRole)) redirect("/unauthorized");

  await prisma.user.update({ where: { id: userId }, data: { role } });
}

