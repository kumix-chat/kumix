export type PluginCapability =
  | "unfurl"
  | "render.markdown"
  | "render.mermaid"
  | "theme.tokens.provide";

export type ThemeTokens = {
  /**
   * CSS variable name without leading `--` (e.g. `bg`, `primary`, `radius-lg`).
   */
  light: Record<string, string>;
  /**
   * CSS variable name without leading `--` (e.g. `bg`, `primary`, `radius-lg`).
   */
  dark: Record<string, string>;
};

export type HostToPluginMessage =
  | { type: "ping"; id: string }
  | { type: "render"; id: string; format: "markdown" | "mermaid"; source: string }
  | { type: "theme.tokens.get"; id: string };

export type PluginToHostMessage =
  | { type: "pong"; id: string }
  | { type: "render.result"; id: string; html: string }
  | { type: "theme.tokens.result"; id: string; tokens: ThemeTokens }
  | { type: "error"; id: string; message: string };

export * from "./wasm";
