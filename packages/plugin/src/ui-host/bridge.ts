import { getActivePolicy, type KumixPolicy } from "../policy/policy";

export type KumixUiPingMessage = { type: "kumix.ping"; id: string; token: string };
export type KumixUiPongMessage = { type: "kumix.pong"; id: string; token: string };

export type SrcDocUiBridge = {
  dispose(): void;
};

export function createUiToken(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

export function isOriginAllowed(policy: KumixPolicy, origin: string): boolean {
  return policy.pluginOrigins.includes("*") || policy.pluginOrigins.includes(origin);
}

function isPingMessage(value: unknown): value is KumixUiPingMessage {
  if (!value || typeof value !== "object") return false;
  const msg = value as Record<string, unknown>;
  return msg.type === "kumix.ping" && typeof msg.id === "string" && typeof msg.token === "string";
}

export function createSrcDocUiPingPongBridge(options: {
  getContentWindow(): Window | null;
  token: string;
  policy?: KumixPolicy;
}): SrcDocUiBridge {
  const policy = options.policy ?? getActivePolicy();

  function onMessage(event: MessageEvent) {
    const win = options.getContentWindow();
    if (!win) return;
    if (event.source !== win) return;
    if (!isOriginAllowed(policy, event.origin)) return;
    if (event.origin !== "null") return;
    if (!isPingMessage(event.data)) return;
    if (event.data.token !== options.token) return;

    // NOTE: For `srcDoc` iframes the origin is always `"null"`, and `postMessage` cannot be restricted
    // to a concrete origin in a portable way. We rely on:
    // - `event.source` matching the iframe window
    // - strict origin check (`"null"`)
    // - a per-instance token handshake
    win.postMessage(
      { type: "kumix.pong", id: event.data.id, token: options.token } satisfies KumixUiPongMessage,
      "*",
    );
  }

  window.addEventListener("message", onMessage);
  return {
    dispose() {
      window.removeEventListener("message", onMessage);
    },
  };
}
