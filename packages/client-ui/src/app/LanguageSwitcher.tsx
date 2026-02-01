import { useLingui } from "@lingui/react"
import { Select } from "@kumix/ui"
import { activateLocale, isSupportedLocale } from "../i18n/i18n"

export function LanguageSwitcher() {
  const { i18n } = useLingui()
  const current = i18n.locale || "en"

  async function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value
    if (!isSupportedLocale(next)) return
    await activateLocale(next)
  }

  return (
    <Select
      aria-label="Language"
      value={current}
      onChange={(event) => void onChange(event)}
    >
      <option value="en">EN</option>
      <option value="ja">日本語</option>
    </Select>
  )
}
