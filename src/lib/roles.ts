import { Role } from "@prisma/client";

export function isAdmin(role?: Role) {
  return role === Role.ADMIN;
}

export function canManageBooks(role?: Role) {
  return role === Role.ADMIN || role === Role.LIBRARIAN;
}

export function canManageUsers(role?: Role) {
  return role === Role.ADMIN;
}

export function canCheckInOut(role?: Role) {
  return role === Role.ADMIN || role === Role.LIBRARIAN || role === Role.MEMBER;
}

