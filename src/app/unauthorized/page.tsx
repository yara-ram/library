import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-sm text-zinc-600">
          You don&apos;t have permission to view this page.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl border bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

