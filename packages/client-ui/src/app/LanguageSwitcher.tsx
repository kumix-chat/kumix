import { Select } from "@kumix/ui";
import { useLingui } from "@lingui/react";
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
    <Select aria-label="Language" value={current} onChange={(event) => void onChange(event)}>
      <option value="en">EN</option>
      <option value="ja">日本語</option>
    </Select>
  );
}
