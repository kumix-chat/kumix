import { i18n } from "@lingui/core"

export const SUPPORTED_LOCALES = ["en", "ja"] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_STORAGE_KEY = "kumix.locale"

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

export function getInitialLocale(): SupportedLocale {
  if (typeof window === "undefined") return "en"
  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return isSupportedLocale(saved) ? saved : "en"
}

export async function activateLocale(locale: SupportedLocale): Promise<void> {
  const { messages } = await import(`../locales/${locale}/messages.po`)
  i18n.load(locale, messages)
  i18n.activate(locale)

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }
}

