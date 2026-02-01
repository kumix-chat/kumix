import type { ButtonHTMLAttributes } from "react"
import { cn } from "../utils/cn"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost"
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/40 disabled:pointer-events-none disabled:opacity-50"

  const variants = {
    primary: "bg-sky-500 text-white hover:bg-sky-400",
    ghost: "border border-white/15 bg-transparent text-white hover:bg-white/5"
  } as const

  return <button className={cn(base, variants[variant], className)} {...props} />
}
