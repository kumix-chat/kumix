import { areCapabilitiesAllowed, getActivePolicy } from "../policy/policy";
import type { BundledUiExtension } from "../runtime/registry";
import { createSrcDocUiPingPongBridge, createUiToken } from "./bridge";
import { injectKumixUiBootstrap } from "./srcdoc";

export type SrcDocUiExtensionIntegration = {
  token: string;
  srcDoc: string;
  attach(getContentWindow: () => Window | null): { dispose(): void };
};

export function createSrcDocUiExtensionIntegration(
  extension: BundledUiExtension,
): SrcDocUiExtensionIntegration {
  const policy = getActivePolicy();

  if (!areCapabilitiesAllowed(policy, extension.manifest.capabilities)) {
    throw new Error(`Policy "${policy.name}" does not allow UI extension capabilities`);
  }

  const originAllowed = policy.pluginOrigins.includes("*") || policy.pluginOrigins.includes("null");
  if (!originAllowed) {
    throw new Error(`Policy "${policy.name}" does not allow srcDoc UI extensions`);
  }

  const token = createUiToken();
  const hostOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const srcDoc = injectKumixUiBootstrap(extension.html, {
    extensionId: extension.manifest.id,
    token,
    hostOrigin,
  });

  return {
    token,
    srcDoc,
    attach(getContentWindow) {
      return createSrcDocUiPingPongBridge({ token, getContentWindow });
    },
  };
}
