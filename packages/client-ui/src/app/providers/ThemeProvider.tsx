import { createProcSessionForExtension, getBundledExtensions } from "@kumix/plugin";
import { useAtom, useAtomValue } from "jotai";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { extensionsEnabledKeysAtom } from "../../features/extensions/state/extensions.atoms";
import { useKumixKeyValue } from "../ports/KeyValueProvider";
import {
  isThemeMode,
  isThemeSource,
  type ThemeMode,
  themeModeAtom,
  themeSourceAtom,
} from "../state/theme.atoms";

const THEME_MODE_KEY = "kumix.theme.mode.v1";
const THEME_SOURCE_KEY = "kumix.theme.source.v1";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function setCssVars(vars: Record<string, string>, previousKeys: Set<string>) {
  const root = document.documentElement;
  for (const key of previousKeys) root.style.removeProperty(`--${key}`);
  previousKeys.clear();

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value);
    previousKeys.add(key);
  }
}

export function ThemeProvider(props: { children: ReactNode }) {
  const keyValue = useKumixKeyValue();
  const enabledKeys = useAtomValue(extensionsEnabledKeysAtom);
  const [mode, setMode] = useAtom(themeModeAtom);
  const [source, setSource] = useAtom(themeSourceAtom);

  const [systemIsDark, setSystemIsDark] = useState(getSystemPrefersDark);
  const effectiveMode: Exclude<ThemeMode, "system"> =
    mode === "system" ? (systemIsDark ? "dark" : "light") : mode;

  const procThemeExtensions = useMemo(() => {
    const { proc } = getBundledExtensions();
    return proc.filter((ext) => ext.manifest.capabilities.includes("theme.tokens.provide"));
  }, []);

  const enabledProcThemeExtensions = useMemo(() => {
    const keySet = new Set(enabledKeys ?? []);
    return procThemeExtensions.filter((ext) => keySet.has(`proc:${ext.manifest.id}`));
  }, [enabledKeys, procThemeExtensions]);

  const appliedKeysRef = useRef(new Set<string>());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme");
    document.body?.classList.add("theme");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", effectiveMode === "dark");
    document.body?.classList.toggle("dark", effectiveMode === "dark");
  }, [effectiveMode]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemIsDark(query.matches);
    handler();
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const rawMode = await keyValue.get(THEME_MODE_KEY);
      const rawSource = await keyValue.get(THEME_SOURCE_KEY);
      if (cancelled) return;

      if (isThemeMode(rawMode)) setMode(rawMode);
      if (isThemeSource(rawSource)) setSource(rawSource);
    })();

    return () => {
      cancelled = true;
    };
  }, [keyValue, setMode, setSource]);

  useEffect(() => {
    void keyValue.set(THEME_MODE_KEY, mode);
  }, [keyValue, mode]);

  useEffect(() => {
    void keyValue.set(THEME_SOURCE_KEY, source);
  }, [keyValue, source]);

  useEffect(() => {
    const previous = appliedKeysRef.current;
    if (typeof document === "undefined") return;
    let cancelled = false;

    if (source === "builtin") {
      setCssVars({}, previous);
      return;
    }

    const id = source.slice("proc:".length);
    const extension = enabledProcThemeExtensions.find((ext) => ext.manifest.id === id);
    if (!extension) {
      setCssVars({}, previous);
      return;
    }

    const session = createProcSessionForExtension(extension);
    void session.ready
      .then(() => session.getThemeTokens())
      .then((tokens) => {
        if (cancelled) return;
        const vars = effectiveMode === "dark" ? tokens.dark : tokens.light;
        setCssVars(vars, previous);
      })
      .catch(() => {
        if (!cancelled) setCssVars({}, previous);
      })
      .finally(() => {
        session.dispose();
      });

    return () => {
      cancelled = true;
      session.dispose();
    };
  }, [effectiveMode, enabledProcThemeExtensions, source]);

  return props.children;
}
