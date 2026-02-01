import type { HostToPluginMessage, PluginToHostMessage } from "@kumix/plugin-sdk"

export type PluginHost = {
  post(message: HostToPluginMessage): void
  onMessage(handler: (message: PluginToHostMessage) => void): () => void
}

export function createPluginHost(): PluginHost {
  const handlers = new Set<(message: PluginToHostMessage) => void>()

  return {
    post(_message) {
      // TODO: iframe/worker bridge
    },
    onMessage(handler) {
      handlers.add(handler)
      return () => handlers.delete(handler)
    }
  }
}

