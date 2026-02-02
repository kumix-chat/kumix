import { Select } from "@kumix/ui";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import type { ChangeEvent } from "react";
import { activateLocale, isSupportedLocale, LOCALE_STORAGE_KEY } from "../i18n/i18n";
import { useKumixKeyValue } from "./ports/KeyValueProvider";

export function LanguageSwitcher() {
  const { i18n } = useLingui();
  const keyValue = useKumixKeyValue();
  const current = i18n.locale || "en";

  async function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!isSupportedLocale(next)) return;
    await activateLocale(next);
    await keyValue.set(LOCALE_STORAGE_KEY, next);
  }

  return (
    <Select
      aria-label={t({ id: "language.label", message: "Language" })}
      value={current}
      onChange={(event) => void onChange(event)}
    >
      <option value="en">
        <Trans id="language.english">English</Trans>
      </option>
      <option value="ja">
        <Trans id="language.japanese">日本語</Trans>
      </option>
    </Select>
  );
}
