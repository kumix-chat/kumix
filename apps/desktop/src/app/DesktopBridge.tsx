import { useEffect, useState } from "react"
import { Button } from "@kumix/ui"
import { invoke, isTauri } from "@tauri-apps/api/core"

type Status =
  | { kind: "unknown" }
  | { kind: "web" }
  | { kind: "ready" }
  | { kind: "message"; message: string }
  | { kind: "error"; message: string }

export function DesktopBridge() {
  const [status, setStatus] = useState<Status>({ kind: "unknown" })

  useEffect(() => {
    setStatus(isTauri() ? { kind: "ready" } : { kind: "web" })
  }, [])

  const label =
    status.kind === "unknown"
      ? "Checking…"
      : status.kind === "web"
        ? "Running in web mode"
        : status.kind === "ready"
          ? "Tauri backend ready"
          : status.kind === "message"
            ? status.message
            : status.message

  async function greet() {
    try {
      const message = await invoke<string>("greet", { name: "kumix" })
      setStatus({ kind: "message", message })
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : String(error) })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button intent="outline" onPress={greet} isDisabled={!isTauri()}>
        Invoke backend
      </Button>
      <span className="text-xs text-slate-200">{label}</span>
    </div>
  )
}
