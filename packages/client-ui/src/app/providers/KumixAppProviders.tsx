import type { KeyValuePort, MatrixAdapterPort } from "@kumix/client-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { createStore } from "jotai/vanilla";
import type { ReactNode } from "react";
import { useState } from "react";
import type { SupportedLocale } from "../../i18n/i18n";
import { I18nAppProvider } from "../I18nAppProvider";
import { KumixKeyValueProvider } from "../ports/KeyValueProvider";
import { KumixMatrixAdapterProvider } from "../ports/MatrixProvider";

export type KumixAppProvidersProps = {
  children: ReactNode;
  initialLocale?: SupportedLocale;
  store?: ReturnType<typeof createStore>;
  queryClient?: QueryClient;
  keyValue?: KeyValuePort;
  matrixAdapter?: MatrixAdapterPort;
};

export function KumixAppProviders(props: KumixAppProvidersProps) {
  const [store] = useState(() => props.store ?? createStore());
  const [queryClient] = useState<QueryClient>(() => props.queryClient ?? new QueryClient());

  return (
    <KumixKeyValueProvider value={props.keyValue}>
      <KumixMatrixAdapterProvider value={props.matrixAdapter}>
        <JotaiProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <I18nAppProvider initialLocale={props.initialLocale}>{props.children}</I18nAppProvider>
          </QueryClientProvider>
        </JotaiProvider>
      </KumixMatrixAdapterProvider>
    </KumixKeyValueProvider>
  );
}
