import { cn } from "@/lib/utils";

export function HeartLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-on-dark",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-6 w-6 text-on-dark"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 22V10l6 8 3-5 3 6 3-9 3 7 6-7v12" />
      </svg>
    </span>
  );
}
