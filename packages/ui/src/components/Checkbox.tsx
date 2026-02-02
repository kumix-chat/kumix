import type { InputHTMLAttributes } from "react";
import { cn } from "../utils/cn";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-white/15 bg-white/5 text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40",
        className,
      )}
      {...props}
    />
  );
}
