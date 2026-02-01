import type { HTMLAttributes } from "react"
import { cn } from "../utils/cn"

export type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl border border-white/10 bg-white/[0.03] shadow-sm", className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("flex flex-col gap-1 p-4", className)} {...props} />
}

export function CardTitle({ className, ...props }: CardProps) {
  return <div className={cn("text-base font-semibold tracking-tight", className)} {...props} />
}

export function CardDescription({ className, ...props }: CardProps) {
  return <div className={cn("text-sm text-slate-200", className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-4 pt-0", className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn("flex items-center gap-2 p-4 pt-0", className)} {...props} />
}

