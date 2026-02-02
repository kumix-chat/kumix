import type { BundledProcExtension } from "../runtime/registry";
import { createProcExtensionSession, type ProcExtensionSession } from "./session";

export type { ProcExtensionSession } from "./session";

export function createProcSessionForExtension(
  extension: BundledProcExtension,
): ProcExtensionSession {
  return createProcExtensionSession(extension.createWorker, {
    timeoutMs: extension.manifest.timeoutMs,
    capabilities: extension.manifest.capabilities,
  });
}
