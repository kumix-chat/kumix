import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import type { SupportedLocale } from "../i18n/i18n"
import { activateLocale, getInitialLocale } from "../i18n/i18n"

export function I18nAppProvider(props: { children: ReactNode; initialLocale?: SupportedLocale }) {
  const [ready, setReady] = useState(false)
  const [initialLocale] = useState<SupportedLocale>(() => props.initialLocale ?? getInitialLocale())

  useEffect(() => {
    let cancelled = false

    activateLocale(initialLocale).then(() => {
      if (!cancelled) setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [initialLocale])

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 grid place-items-center">
        <div className="text-sm text-slate-200">Loading…</div>
      </div>
    )
  }

  return <I18nProvider i18n={i18n}>{props.children}</I18nProvider>
}

