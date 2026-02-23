import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInButtons from "@/components/SignInButtons";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Mini Library</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Sign in with SSO to manage books and loans.
        </p>
        <div className="mt-6">
          <SignInButtons />
        </div>
        <p className="mt-6 text-xs text-zinc-500">
          Tip: The first user to sign in becomes <span className="font-medium">ADMIN</span>.
        </p>
      </div>
    </main>
  );
}

