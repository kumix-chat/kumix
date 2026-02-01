import type { HostToPluginMessage, PluginToHostMessage } from "@kumix/plugin-sdk"

type Pending = {
  resolve(value: any): void
  reject(reason: unknown): void
  timeoutId: number
}

export type ProcWorkerClient = {
  ping(): Promise<void>
  renderMarkdown(source: string): Promise<string>
  dispose(): void
}

export function createProcWorkerClient(worker: Worker, options: { timeoutMs?: number } = {}): ProcWorkerClient {
  const timeoutMs = options.timeoutMs ?? 5_000
  const pendingById = new Map<string, Pending>()

  function nextId(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  }

  function clearPending(id: string) {
    const pending = pendingById.get(id)
    if (!pending) return
    window.clearTimeout(pending.timeoutId)
    pendingById.delete(id)
  }

  function onMessage(event: MessageEvent<PluginToHostMessage>) {
    const message = event.data
    if (!message || typeof message !== "object" || typeof (message as any).type !== "string") return

    if (message.type === "pong") {
      const pending = pendingById.get(message.id)
      if (!pending) return
      clearPending(message.id)
      pending.resolve(undefined)
      return
    }

    if (message.type === "render.result") {
      const pending = pendingById.get(message.id)
      if (!pending) return
      clearPending(message.id)
      pending.resolve(message.html)
      return
    }

    if (message.type === "error") {
      const pending = pendingById.get(message.id)
      if (!pending) return
      clearPending(message.id)
      pending.reject(new Error(message.message))
      return
    }
  }

  worker.addEventListener("message", onMessage as any)

  function request(message: HostToPluginMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        pendingById.delete(message.id)
        reject(new Error(`Proc worker timed out (${message.type})`))
      }, timeoutMs)

      pendingById.set(message.id, { resolve, reject, timeoutId })
      worker.postMessage(message)
    })
  }

  return {
    async ping() {
      await request({ type: "ping", id: nextId() })
    },
    async renderMarkdown(source) {
      const html = await request({ type: "render", id: nextId(), format: "markdown", source })
      return String(html)
    },
    dispose() {
      worker.removeEventListener("message", onMessage as any)
      for (const id of pendingById.keys()) clearPending(id)
      worker.terminate()
    }
  }
}

