export type ProcState =
  | { kind: "idle" }
  | { kind: "ready" }
  | { kind: "rendering" }
  | { kind: "error"; message: string }

export type ExtensionKey = `ui:${string}` | `proc:${string}`

export type ProcFormat = "markdown" | "mermaid"

