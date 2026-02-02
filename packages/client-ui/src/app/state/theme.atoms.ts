import { atom } from "jotai";

export type ThemeMode = "system" | "light" | "dark";
export type ThemeSource = "builtin" | `proc:${string}`;

export const themeModeAtom = atom<ThemeMode>("system");
export const themeSourceAtom = atom<ThemeSource>("builtin");

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function isThemeSource(value: unknown): value is ThemeSource {
  return value === "builtin" || (typeof value === "string" && value.startsWith("proc:"));
}
