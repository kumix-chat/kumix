export type PluginCapability = "unfurl" | "render.markdown" | "render.mermaid"

export type HostToPluginMessage =
  | { type: "ping"; id: string }
  | { type: "render"; id: string; format: "markdown" | "mermaid"; source: string }

export type PluginToHostMessage =
  | { type: "pong"; id: string }
  | { type: "render.result"; id: string; html: string }
  | { type: "error"; id: string; message: string }

