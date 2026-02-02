import { getBundledExtensions } from "@kumix/plugin";
import { useSetAtom } from "jotai";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { extensionsEnabledKeysAtom } from "../../features/extensions/state/extensions.atoms";
import type { ExtensionKey } from "../../features/extensions/state/extensions.types";
import { useKumixKeyValue } from "../ports/KeyValueProvider";

const EXTENSIONS_ENABLED_KEY = "kumix.extensions.enabled.v1";

function isExtensionKey(value: unknown): value is ExtensionKey {
  return typeof value === "string" && (value.startsWith("ui:") || value.startsWith("proc:"));
}

function parseEnabledKeys(raw: string | null): ExtensionKey[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isExtensionKey);
  } catch {
    return null;
  }
}

export function ExtensionEnablementProvider(props: { children: ReactNode }) {
  const keyValue = useKumixKeyValue();
  const setEnabledKeys = useSetAtom(extensionsEnabledKeysAtom);

  const allKeys = useMemo<ExtensionKey[]>(() => {
    const { ui, proc } = getBundledExtensions();
    return [
      ...ui.map((ext) => `ui:${ext.manifest.id}` as const),
      ...proc.map((ext) => `proc:${ext.manifest.id}` as const),
    ];
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const raw = await keyValue.get(EXTENSIONS_ENABLED_KEY);
      const parsed = parseEnabledKeys(raw);
      const normalized = (parsed ?? allKeys).filter((key) => allKeys.includes(key));
      if (cancelled) return;
      setEnabledKeys(normalized);
      await keyValue.set(EXTENSIONS_ENABLED_KEY, JSON.stringify(normalized));
    })();

    return () => {
      cancelled = true;
    };
  }, [allKeys, keyValue, setEnabledKeys]);

  return props.children;
}
