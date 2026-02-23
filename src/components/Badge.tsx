import clsx from "clsx";

export default function Badge({
  children,
  variant = "neutral"
}: {
  children: React.ReactNode;
  variant?: "neutral" | "green" | "yellow" | "red" | "blue";
}) {
  const classes =
    variant === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : variant === "yellow"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : variant === "red"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : variant === "blue"
            ? "bg-sky-50 text-sky-700 border-sky-200"
            : "bg-zinc-50 text-zinc-700 border-zinc-200";

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        classes
      )}
    >
      {children}
    </span>
  );
}
