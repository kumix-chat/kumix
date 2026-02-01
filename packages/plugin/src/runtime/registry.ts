import type { PluginCapability } from "@kumix/plugin-sdk"
import githubPanelHtml from "../../../../extensions/ui/github-panel/entry.html?raw"
import githubPanelManifest from "../../../../extensions/ui/github-panel/manifest.json"
import markdownRendererManifest from "../../../../extensions/proc/markdown-renderer/manifest.json"

export type UiExtensionManifest = {
  id: string
  name: string
  version: string
  capabilities: PluginCapability[]
}

export type ProcExtensionManifest = {
  id: string
  name: string
  version: string
  capabilities: PluginCapability[]
}

export type BundledUiExtension = {
  kind: "ui"
  manifest: UiExtensionManifest
  html: string
}

export type BundledProcExtension = {
  kind: "proc"
  manifest: ProcExtensionManifest
  createWorker(): Worker
}

export function getBundledExtensions(): { ui: BundledUiExtension[]; proc: BundledProcExtension[] } {
  return {
    ui: [
      {
        kind: "ui",
        manifest: githubPanelManifest as UiExtensionManifest,
        html: githubPanelHtml
      }
    ],
    proc: [
      {
        kind: "proc",
        manifest: markdownRendererManifest as ProcExtensionManifest,
        createWorker: () =>
          new Worker(new URL("../../../../extensions/proc/markdown-renderer/worker.ts", import.meta.url), {
            type: "module"
          })
      }
    ]
  }
}

