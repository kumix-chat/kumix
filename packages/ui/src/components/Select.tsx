import type { SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-9 rounded-lg border border-[color:var(--border)] bg-[var(--overlay)] px-2 text-sm text-[color:var(--overlay-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
