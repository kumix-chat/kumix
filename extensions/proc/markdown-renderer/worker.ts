import type { HostToPluginMessage, PluginToHostMessage } from "@kumix/plugin-sdk"

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function renderMarkdown(source: string): string {
  const lines = source.split(/\r?\n/g)

  const html = lines
    .map((line) => {
      if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`
      if (line.startsWith("# ")) return `<h1>${escapeHtml(line.slice(2))}</h1>`
      if (!line.trim()) return ""
      return `<p>${escapeHtml(line)}</p>`
    })
    .join("")

  return `<div>${html || "<p></p>"}</div>`
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
    if (message.format !== "markdown") {
      post({ type: "error", id: message.id, message: `Unsupported format: ${message.format}` })
      return
    }

    post({ type: "render.result", id: message.id, html: renderMarkdown(message.source) })
    return
  }
})

