import { i18n } from "@lingui/core";

export const SUPPORTED_LOCALES = ["en", "ja"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_STORAGE_KEY = "kumix.locale";

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function getInitialLocale(): SupportedLocale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.split("-")[0];
  return isSupportedLocale(lang) ? lang : "en";
}

export async function activateLocale(locale: SupportedLocale): Promise<void> {
  const { messages } = await import(`../locales/${locale}/messages.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}
