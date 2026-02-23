import Link from "next/link";

export default function LinkButton({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-xl border bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
    >
      {children}
    </Link>
  );
}

