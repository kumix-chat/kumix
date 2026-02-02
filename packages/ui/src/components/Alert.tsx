import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive";
};

export function Alert({ variant = "default", className, ...props }: AlertProps) {
  const base = "relative w-full rounded-xl border p-4";
  const variants = {
    default: "border-[color:var(--border)] bg-[var(--overlay)] text-[color:var(--overlay-fg)]",
    destructive: "border-red-500/30 bg-red-500/10 text-red-100",
  } as const;

  return <div role="alert" className={cn(base, variants[variant], className)} {...props} />;
}

export type AlertTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <h5 className={cn("mb-1 font-semibold leading-none tracking-tight", className)} {...props} />
  );
}

export type AlertDescriptionProps = HTMLAttributes<HTMLDivElement>;

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
}
