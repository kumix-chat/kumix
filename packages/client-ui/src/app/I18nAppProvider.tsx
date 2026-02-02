import { Card, CardContent, CardHeader, CardTitle } from "@kumix/ui";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { SupportedLocale } from "../i18n/i18n";
import {
  activateLocale,
  getInitialLocale,
  isSupportedLocale,
  LOCALE_STORAGE_KEY,
} from "../i18n/i18n";
import { useKumixKeyValue } from "./ports/KeyValueProvider";

export function I18nAppProvider(props: { children: ReactNode; initialLocale?: SupportedLocale }) {
  const keyValue = useKumixKeyValue();
  const [ready, setReady] = useState(false);
  const [locale, setLocale] = useState<SupportedLocale>(
    () => props.initialLocale ?? getInitialLocale(),
  );
  const loadingText = locale === "ja" ? "読み込み中..." : "Loading...";

  useEffect(() => {
    if (props.initialLocale) return;
    let cancelled = false;

    void (async () => {
      const saved = await keyValue.get(LOCALE_STORAGE_KEY);
      if (cancelled) return;
      if (isSupportedLocale(saved)) setLocale(saved);
    })();

    return () => {
      cancelled = true;
    };
  }, [keyValue, props.initialLocale]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await activateLocale(locale);
      if (!cancelled) setReady(true);
      await keyValue.set(LOCALE_STORAGE_KEY, locale);
    })();

    return () => {
      cancelled = true;
    };
  }, [keyValue, locale]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--bg)] text-[color:var(--fg)]">
        <Card className="w-[320px]">
          <CardHeader>
            <CardTitle>kumix</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[color:var(--muted-fg)]">
            {loadingText}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <I18nProvider i18n={i18n}>{props.children}</I18nProvider>;
}
