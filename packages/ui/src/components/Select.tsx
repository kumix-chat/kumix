import type { SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-9 rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40",
        className,
      )}
      {...props}
    />
  );
}
