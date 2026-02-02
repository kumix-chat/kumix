import type { KeyValuePort } from "@kumix/client-core";
import { createBrowserLocalStorageKeyValue } from "@kumix/storage";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

const KeyValueContext = createContext<KeyValuePort | null>(null);

export function KumixKeyValueProvider(props: { children: ReactNode; value?: KeyValuePort }) {
  const value = useMemo(() => props.value ?? createBrowserLocalStorageKeyValue(), [props.value]);
  return <KeyValueContext.Provider value={value}>{props.children}</KeyValueContext.Provider>;
}

export function useKumixKeyValue(): KeyValuePort {
  const value = useContext(KeyValueContext);
  if (!value) return createBrowserLocalStorageKeyValue();
  return value;
}
