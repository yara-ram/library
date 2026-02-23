"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="rounded-xl border bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
    >
      Sign out
    </button>
  );
}

