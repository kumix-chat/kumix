import type { HostToPluginMessage, PluginToHostMessage, ThemeTokens } from "@kumix/plugin-sdk";

const tokens: ThemeTokens = {
  light: {
    // "Default" theme is intentionally not identical to Builtin.
    // Light: slightly warm "paper" background with teal accent.
    bg: "oklch(0.98 0.01 85)",
    fg: "oklch(0.2 0.01 275)",
    primary: "oklch(0.62 0.16 195)",
    "primary-fg": "oklch(0.99 0 0)",
    secondary: "oklch(0.92 0.01 85)",
    "secondary-fg": "oklch(0.19 0.01 275)",
    muted: "oklch(0.95 0.01 85)",
    "muted-fg": "oklch(0.5 0.02 275)",
    border: "oklch(0.88 0.02 85)",
    input: "oklch(0.92 0.01 85)",
    ring: "oklch(0.62 0.16 195)",
    overlay: "oklch(0.99 0.01 85)",
    "overlay-fg": "oklch(0.2 0.01 275)",
    navbar: "oklch(0.98 0.01 85)",
    "navbar-fg": "oklch(0.2 0.01 275)",
    sidebar: "oklch(0.975 0.01 85)",
    "sidebar-fg": "oklch(0.2 0.01 275)",
    "radius-lg": "0.75rem",
  },
  dark: {
    // Dark: "graphite" background with the same teal accent for continuity.
    bg: "oklch(0.2 0.02 265)",
    fg: "oklch(0.97 0.01 85)",
    primary: "oklch(0.68 0.14 195)",
    "primary-fg": "oklch(0.12 0.01 265)",
    secondary: "oklch(0.28 0.02 265)",
    "secondary-fg": "oklch(0.97 0.01 85)",
    muted: "oklch(0.24 0.02 265)",
    "muted-fg": "oklch(0.78 0.02 85)",
    border: "oklch(0.32 0.03 265)",
    input: "oklch(0.28 0.02 265)",
    ring: "oklch(0.68 0.14 195)",
    overlay: "oklch(0.22 0.02 265)",
    "overlay-fg": "oklch(0.97 0.01 85)",
    navbar: "oklch(0.19 0.02 265)",
    "navbar-fg": "oklch(0.97 0.01 85)",
    sidebar: "oklch(0.185 0.02 265)",
    "sidebar-fg": "oklch(0.97 0.01 85)",
    "radius-lg": "0.75rem",
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
