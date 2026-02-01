import type { TextareaHTMLAttributes } from "react"
import { cn } from "../utils/cn"

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40",
        className
      )}
      {...props}
    />
  )
}

