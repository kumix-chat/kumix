import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider as JotaiProvider } from "jotai"
import { createStore, type Store } from "jotai/vanilla"
import type { ReactNode } from "react"
import { useState } from "react"
import type { SupportedLocale } from "../../i18n/i18n"
import { I18nAppProvider } from "../I18nAppProvider"

export type KumixAppProvidersProps = {
  children: ReactNode
  initialLocale?: SupportedLocale
  store?: Store
  queryClient?: QueryClient
}

export function KumixAppProviders(props: KumixAppProvidersProps) {
  const [store] = useState<Store>(() => props.store ?? createStore())
  const [queryClient] = useState<QueryClient>(() => props.queryClient ?? new QueryClient())

  return (
    <JotaiProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <I18nAppProvider initialLocale={props.initialLocale}>{props.children}</I18nAppProvider>
      </QueryClientProvider>
    </JotaiProvider>
  )
}

