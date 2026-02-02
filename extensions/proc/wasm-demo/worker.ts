import type { HostToPluginMessage, PluginToHostMessage } from "@kumix/plugin-sdk";
import { instantiateWasm } from "@kumix/plugin-sdk";
import { addWasmBytes } from "./wasm/addWasm";

type AddExport = (a: number, b: number) => number;

let addExport: AddExport | null = null;

async function ensureAdd(): Promise<AddExport> {
  if (addExport) return addExport;
  const { instance } = await instantiateWasm(addWasmBytes);
  const exportsRecord = instance.exports as Record<string, unknown>;
  const add = exportsRecord.add as AddExport | undefined;
  if (!add) throw new Error("WASM export `add` not found");
  addExport = add;
  return add;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderMarkdownMinimal(source: string): string {
  const lines = source.split(/\r?\n/g);
  const html = lines
    .map((line) => {
      if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      if (line.startsWith("# ")) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      if (!line.trim()) return "";
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("");
  return `<div>${html || "<p></p>"}</div>`;
}

async function renderMarkdownWithWasm(source: string): Promise<string> {
  const add = await ensureAdd();
  const length = source.length;
  const computed = add(length, 42);
  const rendered = renderMarkdownMinimal(source);
  return `<div><p><strong>WASM</strong>: add(source.length, 42) = ${computed}</p>${rendered}</div>`;
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
    (async () => {
      if (message.format !== "markdown") {
        post({ type: "error", id: message.id, message: `Unsupported format: ${message.format}` });
        return;
      }

      const html = await renderMarkdownWithWasm(message.source);
      post({ type: "render.result", id: message.id, html });
    })().catch((error) => {
      post({
        type: "error",
        id: message.id,
        message: error instanceof Error ? error.message : String(error),
      });
    });
    return;
  }
});
