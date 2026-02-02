import type { PluginCapability } from "@kumix/plugin-sdk";

export type KumixPolicy = {
  name: string;
  capabilities: string[];
  pluginOrigins: string[];
};

export type PolicyName = "dev" | "strict";

type ImportMetaEnv = { env?: Record<string, unknown> };

function readEnv(name: string): string | undefined {
  const metaEnv = (import.meta as unknown as ImportMetaEnv).env;
  const metaValue = metaEnv?.[name];
  if (typeof metaValue === "string" && metaValue.length > 0) return metaValue;

  const processEnv =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined> | undefined)
      : undefined;
  const processValue = processEnv?.[name];
  if (typeof processValue === "string" && processValue.length > 0) return processValue;

  return undefined;
}

function readMode(): string | undefined {
  const metaEnv = (import.meta as unknown as ImportMetaEnv).env;
  const mode = metaEnv?.MODE;
  if (typeof mode === "string") return mode;
  return readEnv("NODE_ENV");
}

export function getActivePolicyName(): PolicyName {
  const override = readEnv("VITE_KUMIX_POLICY") ?? readEnv("KUMIX_POLICY");
  if (override === "dev" || override === "strict") return override;

  const mode = readMode();
  if (mode === "development" || mode === "test") return "dev";
  return "strict";
}

function loadBundledPolicies(): Record<string, KumixPolicy> {
  return import.meta.glob("../../../../policies/defaults/policy.*.json", {
    eager: true,
    import: "default",
  }) as Record<string, KumixPolicy>;
}

export function getBundledPolicy(name: PolicyName): KumixPolicy {
  const policies = loadBundledPolicies();
  const match = Object.values(policies).find((policy) => policy.name === name);
  if (match) return match;

  return { name, capabilities: [], pluginOrigins: [] };
}

export function getActivePolicy(): KumixPolicy {
  return getBundledPolicy(getActivePolicyName());
}

export function isCapabilityAllowed(policy: KumixPolicy, capability: PluginCapability): boolean {
  if (policy.capabilities.includes("*")) return true;
  return policy.capabilities.includes(capability);
}

export function areCapabilitiesAllowed(
  policy: KumixPolicy,
  capabilities: PluginCapability[],
): boolean {
  if (policy.capabilities.includes("*")) return true;
  return capabilities.every((capability) => policy.capabilities.includes(capability));
}
