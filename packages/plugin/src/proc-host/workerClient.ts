import type { HostToPluginMessage, PluginToHostMessage, ThemeTokens } from "@kumix/plugin-sdk";

type Pending<T> = {
  resolve(value: T): void;
  reject(reason: unknown): void;
  timeoutId: number;
};

export type ProcRenderFormat = "markdown" | "mermaid";

export type ProcWorkerClient = {
  ping(): Promise<void>;
  renderMarkdown(source: string): Promise<string>;
  renderMermaid(source: string): Promise<string>;
  getThemeTokens(): Promise<ThemeTokens>;
  dispose(): void;
};

function isPluginToHostMessage(value: unknown): value is PluginToHostMessage {
  if (!value || typeof value !== "object") return false;
  const msg = value as Record<string, unknown>;
  return typeof msg.type === "string" && typeof msg.id === "string";
}

export function createProcWorkerClient(
  worker: Worker,
  options: { timeoutMs?: number } = {},
): ProcWorkerClient {
  const timeoutMs = options.timeoutMs ?? 5_000;
  const pendingById = new Map<string, Pending<unknown>>();

  function nextId(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  }

  function clearPending(id: string) {
    const pending = pendingById.get(id);
    if (!pending) return;
    window.clearTimeout(pending.timeoutId);
    pendingById.delete(id);
  }

  function onMessage(event: MessageEvent<unknown>) {
    if (!isPluginToHostMessage(event.data)) return;
    const message = event.data;

    if (message.type === "pong") {
      const pending = pendingById.get(message.id);
      if (!pending) return;
      clearPending(message.id);
      pending.resolve(undefined);
      return;
    }

    if (message.type === "render.result") {
      const pending = pendingById.get(message.id);
      if (!pending) return;
      clearPending(message.id);
      pending.resolve(message.html);
      return;
    }

    if (message.type === "theme.tokens.result") {
      const pending = pendingById.get(message.id);
      if (!pending) return;
      clearPending(message.id);
      pending.resolve(message.tokens);
      return;
    }

    if (message.type === "error") {
      const pending = pendingById.get(message.id);
      if (!pending) return;
      clearPending(message.id);
      pending.reject(new Error(message.message));
      return;
    }
  }

  worker.addEventListener("message", onMessage);

  function request<T>(message: HostToPluginMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        pendingById.delete(message.id);
        reject(new Error(`Proc worker timed out (${message.type})`));
      }, timeoutMs);

      pendingById.set(message.id, {
        resolve: resolve as Pending<unknown>["resolve"],
        reject,
        timeoutId,
      });
      worker.postMessage(message);
    });
  }

  async function render(format: ProcRenderFormat, source: string): Promise<string> {
    const html = await request<string>({ type: "render", id: nextId(), format, source });
    return String(html);
  }

  return {
    async ping() {
      await request<void>({ type: "ping", id: nextId() });
    },
    async renderMarkdown(source) {
      return render("markdown", source);
    },
    async renderMermaid(source) {
      return render("mermaid", source);
    },
    async getThemeTokens() {
      return request<ThemeTokens>({ type: "theme.tokens.get", id: nextId() });
    },
    dispose() {
      worker.removeEventListener("message", onMessage);
      for (const id of pendingById.keys()) clearPending(id);
      worker.terminate();
    },
  };
}
