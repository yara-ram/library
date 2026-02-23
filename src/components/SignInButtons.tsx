"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

function Button({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
    >
      {children}
    </button>
  );
}

export default function SignInButtons() {
  const [providers, setProviders] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    void getProviders().then(setProviders);
  }, []);

  if (providers && Object.keys(providers).length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No SSO providers are configured. Set GitHub or Google credentials in your{" "}
        <code className="rounded bg-white px-1 py-0.5 text-xs">.env</code>.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {providers
        ? Object.values(providers).map((p: any) => (
            <Button key={p.id} onClick={() => signIn(p.id, { callbackUrl: "/dashboard" })}>
              Continue with {p.name}
            </Button>
          ))
        : null}
    </div>
  );
}
