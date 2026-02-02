import type { HostToPluginMessage, PluginToHostMessage } from "@kumix/plugin-sdk"

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function renderMermaid(source: string): string {
  const code = escapeHtml(source.trim())
  const header = `<div class="text-xs text-slate-300">Mermaid (placeholder)</div>`
  const body = `<pre class="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs">${code}</pre>`
  return `<div>${header}${body}</div>`
}

function post(message: PluginToHostMessage) {
  self.postMessage(message)
}

self.addEventListener("message", (event: MessageEvent<HostToPluginMessage>) => {
  const message = event.data

  if (message.type === "ping") {
    post({ type: "pong", id: message.id })
    return
  }

  if (message.type === "render") {
    if (message.format !== "mermaid") {
      post({ type: "error", id: message.id, message: `Unsupported format: ${message.format}` })
      return
    }

    post({ type: "render.result", id: message.id, html: renderMermaid(message.source) })
    return
  }
})

