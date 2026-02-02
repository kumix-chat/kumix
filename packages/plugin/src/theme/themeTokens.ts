import type { ThemeTokens } from "@kumix/plugin-sdk";

const ALLOWED_KEYS = new Set<string>([
  "accent",
  "accent-fg",
  "bg",
  "border",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "danger",
  "danger-fg",
  "danger-subtle",
  "danger-subtle-fg",
  "fg",
  "font-mono",
  "font-sans",
  "info-subtle",
  "info-subtle-fg",
  "input",
  "muted",
  "muted-fg",
  "navbar",
  "navbar-fg",
  "overlay",
  "overlay-fg",
  "primary",
  "primary-fg",
  "primary-subtle",
  "primary-subtle-fg",
  "radius-lg",
  "ring",
  "secondary",
  "secondary-fg",
  "sidebar",
  "sidebar-accent",
  "sidebar-accent-fg",
  "sidebar-border",
  "sidebar-fg",
  "sidebar-primary",
  "sidebar-primary-fg",
  "sidebar-ring",
  "success",
  "success-fg",
  "success-subtle",
  "success-subtle-fg",
  "warning",
  "warning-fg",
  "warning-subtle",
  "warning-subtle-fg",
]);

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).every((v) => typeof v === "string");
}

function validateTokenMap(map: unknown, mode: "light" | "dark"): Record<string, string> {
  if (!isStringRecord(map)) {
    throw new Error(`Invalid theme tokens (${mode}): expected record of strings`);
  }

  for (const key of Object.keys(map)) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new Error(`Invalid theme token key "${key}" (${mode})`);
    }
  }

  return map;
}

export function validateThemeTokens(value: unknown): ThemeTokens {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid theme tokens: expected object");
  }
  const obj = value as Record<string, unknown>;
  const light = validateTokenMap(obj.light, "light");
  const dark = validateTokenMap(obj.dark, "dark");
  return { light, dark };
}
