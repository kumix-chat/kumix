import { getBundledExtensions } from "@kumix/plugin";
import { Select } from "@kumix/ui";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";
import { extensionsEnabledKeysAtom } from "../features/extensions/state/extensions.atoms";
import {
  isThemeMode,
  isThemeSource,
  type ThemeSource,
  themeModeAtom,
  themeSourceAtom,
} from "./state/theme.atoms";

export function ThemeSwitcher() {
  const enabledKeys = useAtomValue(extensionsEnabledKeysAtom) ?? [];
  const [mode, setMode] = useAtom(themeModeAtom);
  const [source, setSource] = useAtom(themeSourceAtom);

  const enabledThemeSources = useMemo(() => {
    const enabled = new Set(enabledKeys);
    const { proc } = getBundledExtensions();
    const themes = proc
      .filter((ext) => ext.manifest.capabilities.includes("theme.tokens.provide"))
      .filter((ext) => enabled.has(`proc:${ext.manifest.id}`))
      .map(
        (ext) =>
          ({
            value: `proc:${ext.manifest.id}` as const,
            label: ext.manifest.name,
          }) satisfies { value: ThemeSource; label: string },
      );

    return [{ value: "builtin", label: "Builtin" } as const, ...themes];
  }, [enabledKeys]);

  useEffect(() => {
    if (enabledThemeSources.some((s) => s.value === source)) return;
    setSource("builtin");
  }, [enabledThemeSources, setSource, source]);

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Theme mode"
        value={mode}
        onChange={(event) => {
          const next = event.target.value;
          if (isThemeMode(next)) setMode(next);
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </Select>
      <Select
        aria-label="Theme"
        value={source}
        onChange={(event) => {
          const next = event.target.value;
          if (isThemeSource(next)) setSource(next);
        }}
      >
        {enabledThemeSources.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
