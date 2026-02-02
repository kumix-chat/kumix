import type { PluginCapability } from "@kumix/plugin-sdk";
import { areCapabilitiesAllowed, getActivePolicy } from "../policy/policy";

export type UiExtensionManifest = {
  id: string;
  name: string;
  version: string;
  capabilities: PluginCapability[];
};

export type ProcExtensionManifest = {
  id: string;
  name: string;
  version: string;
  capabilities: PluginCapability[];
  timeoutMs?: number;
};

export type BundledUiExtension = {
  kind: "ui";
  manifest: UiExtensionManifest;
  html: string;
};

export type BundledProcExtension = {
  kind: "proc";
  manifest: ProcExtensionManifest;
  createWorker(): Worker;
};

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function extractExtensionDirId(path: string, kind: "ui" | "proc"): string | undefined {
  const normalized = normalizePath(path);
  const marker = `extensions/${kind}/`;
  const idx = normalized.indexOf(marker);
  if (idx === -1) return undefined;
  const rest = normalized.slice(idx + marker.length);
  const [id] = rest.split("/");
  return id || undefined;
}

export function getBundledExtensions(): { ui: BundledUiExtension[]; proc: BundledProcExtension[] } {
  const policy = getActivePolicy();
  const uiOriginAllowed =
    policy.pluginOrigins.includes("*") || policy.pluginOrigins.includes("null");
  const uiManifests = import.meta.glob("../../../../extensions/ui/*/manifest.json", {
    eager: true,
    import: "default",
  }) as Record<string, UiExtensionManifest>;

  const uiHtml = import.meta.glob("../../../../extensions/ui/*/entry.html", {
    eager: true,
    import: "default",
    query: "?raw",
  }) as Record<string, string>;

  const procManifests = import.meta.glob("../../../../extensions/proc/*/manifest.json", {
    eager: true,
    import: "default",
  }) as Record<string, ProcExtensionManifest>;

  const procWorkers = import.meta.glob("../../../../extensions/proc/*/worker.ts");

  const ui = Object.entries(uiManifests)
    .map(([manifestPath, manifest]) => {
      const dirId = extractExtensionDirId(manifestPath, "ui");
      if (!dirId) return null;
      if (manifest.id !== dirId) return null;
      if (!areCapabilitiesAllowed(policy, manifest.capabilities)) return null;
      if (!uiOriginAllowed) return null;

      const htmlPath = normalizePath(manifestPath).replace(/manifest\.json$/u, "entry.html");
      const html = uiHtml[htmlPath];
      if (typeof html !== "string") return null;

      return { kind: "ui", manifest, html } satisfies BundledUiExtension;
    })
    .filter((value): value is BundledUiExtension => Boolean(value))
    .sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));

  const proc = Object.entries(procManifests)
    .map(([manifestPath, manifest]) => {
      const dirId = extractExtensionDirId(manifestPath, "proc");
      if (!dirId) return null;
      if (manifest.id !== dirId) return null;
      if (!areCapabilitiesAllowed(policy, manifest.capabilities)) return null;

      const workerPath = normalizePath(manifestPath).replace(/manifest\.json$/u, "worker.ts");
      if (!(workerPath in procWorkers)) return null;

      return {
        kind: "proc",
        manifest,
        createWorker: () => new Worker(new URL(workerPath, import.meta.url), { type: "module" }),
      } satisfies BundledProcExtension;
    })
    .filter((value): value is BundledProcExtension => Boolean(value))
    .sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));

  return { ui, proc };
}
