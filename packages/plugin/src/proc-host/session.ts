import type { PluginCapability } from "@kumix/plugin-sdk";
import { areCapabilitiesAllowed, getActivePolicy, type KumixPolicy } from "../policy/policy";
import { createProcWorkerClient } from "./workerClient";

export type ProcExtensionSession = {
  ready: Promise<void>;
  renderMarkdown(source: string): Promise<string>;
  renderMermaid(source: string): Promise<string>;
  dispose(): void;
};

function hasCapability(
  capabilities: PluginCapability[] | undefined,
  capability: PluginCapability,
): boolean {
  if (!capabilities) return true;
  return capabilities.includes(capability);
}

export function createProcExtensionSession(
  createWorker: () => Worker,
  options: { timeoutMs?: number; capabilities?: PluginCapability[]; policy?: KumixPolicy } = {},
): ProcExtensionSession {
  const policy = options.policy ?? getActivePolicy();
  if (options.capabilities && !areCapabilitiesAllowed(policy, options.capabilities)) {
    throw new Error(`Policy "${policy.name}" does not allow requested proc capabilities`);
  }

  const worker = createWorker();
  const client = createProcWorkerClient(worker, { timeoutMs: options.timeoutMs });
  let disposed = false;

  const ready = client.ping();

  function ensureAvailable() {
    if (disposed) throw new Error("Proc extension session is disposed");
  }

  function ensureCapability(capability: PluginCapability) {
    if (!hasCapability(options.capabilities, capability)) {
      throw new Error(`Proc extension does not declare capability: ${capability}`);
    }
  }

  async function call<T>(fn: () => Promise<T>): Promise<T> {
    ensureAvailable();
    return fn();
  }

  return {
    ready,
    async renderMarkdown(source) {
      ensureCapability("render.markdown");
      return call(() => client.renderMarkdown(source));
    },
    async renderMermaid(source) {
      ensureCapability("render.mermaid");
      return call(() => client.renderMermaid(source));
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      client.dispose();
    },
  };
}
