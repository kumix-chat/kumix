import type { HostToPluginMessage, PluginToHostMessage, ThemeTokens } from "@kumix/plugin-sdk";

const tokens: ThemeTokens = {
  light: {
    bg: "oklch(1 0 0)",
    fg: "oklch(0.21 0.006 285.885)",
    primary: "oklch(0.546 0.245 262.881)",
    "primary-fg": "oklch(1 0 0)",
    secondary: "oklch(0.92 0.004 286.32)",
    "secondary-fg": "oklch(0.141 0.005 285.823)",
    muted: "oklch(0.967 0.001 286.375)",
    "muted-fg": "oklch(0.552 0.016 285.938)",
    border: "oklch(0.911 0.006 286.286)",
    input: "oklch(0.871 0.006 286.286)",
    ring: "oklch(0.546 0.245 262.881)",
    "radius-lg": "0.5rem",
  },
  dark: {
    bg: "oklch(0.181 0.005 285.823)",
    fg: "oklch(0.985 0 0)",
    primary: "oklch(0.546 0.245 262.881)",
    "primary-fg": "oklch(1 0 0)",
    secondary: "oklch(0.244 0.006 286.033)",
    "secondary-fg": "oklch(0.985 0 0)",
    muted: "oklch(0.21 0.006 285.885)",
    "muted-fg": "oklch(0.705 0.015 286.067)",
    border: "oklch(0.27 0.013 285.805)",
    input: "oklch(0.31 0.013 285.805)",
    ring: "oklch(0.546 0.245 262.881)",
    "radius-lg": "0.5rem",
  },
};

function post(message: PluginToHostMessage) {
  self.postMessage(message);
}

self.addEventListener("message", (event: MessageEvent<unknown>) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;
  const record = data as Record<string, unknown>;
  if (typeof record.type !== "string" || typeof record.id !== "string") return;
  const message = data as HostToPluginMessage;

  if (message.type === "ping") {
    post({ type: "pong", id: message.id });
    return;
  }

  if (message.type === "theme.tokens.get") {
    post({ type: "theme.tokens.result", id: message.id, tokens });
    return;
  }

  post({ type: "error", id: message.id, message: `Unsupported message: ${message.type}` });
});
