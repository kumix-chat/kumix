import type { HostToPluginMessage, PluginToHostMessage } from "@kumix/plugin-sdk";
import { marked } from "marked";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

marked.setOptions({
  gfm: true,
  breaks: false,
  mangle: false,
  headerIds: false,
});

marked.use({
  walkTokens(token) {
    if (token.type !== "html") return;
    // Prevent raw HTML injection by escaping "html" tokens.
    // This keeps the demo safe-ish without needing a DOM sanitizer inside a worker.
    (token as unknown as { text?: string; raw?: string }).text = escapeHtml(
      String((token as unknown as { text?: string }).text ?? ""),
    );
    (token as unknown as { raw?: string }).raw = escapeHtml(String(token.raw ?? ""));
  },
});

function renderMarkdown(source: string): string {
  const html = marked.parse(source) as string;
  return `<article class="kumix-prose">${html || "<p></p>"}</article>`;
}

function post(message: PluginToHostMessage) {
  self.postMessage(message);
}

self.addEventListener("message", (event: MessageEvent<HostToPluginMessage>) => {
  const message = event.data;

  if (message.type === "ping") {
    post({ type: "pong", id: message.id });
    return;
  }

  if (message.type === "render") {
    if (message.format !== "markdown") {
      post({ type: "error", id: message.id, message: `Unsupported format: ${message.format}` });
      return;
    }

    post({ type: "render.result", id: message.id, html: renderMarkdown(message.source) });
    return;
  }
});
