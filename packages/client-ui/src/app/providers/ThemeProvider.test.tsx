import { render } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai";
import { createStore } from "jotai/vanilla";
import { describe, expect, it } from "vitest";
import { extensionsEnabledKeysAtom } from "../../features/extensions/state/extensions.atoms";
import { KumixKeyValueProvider } from "../ports/KeyValueProvider";
import { themeModeAtom, themeSourceAtom } from "../state/theme.atoms";
import { ThemeProvider } from "./ThemeProvider";

function createMemoryKeyValue() {
  const map = new Map<string, string>();
  return {
    async get(key: string) {
      return map.get(key) ?? null;
    },
    async set(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe("ThemeProvider", () => {
  it("adds `theme` class and toggles `dark`", async () => {
    const store = createStore();
    store.set(extensionsEnabledKeysAtom, []);
    store.set(themeSourceAtom, "builtin");
    store.set(themeModeAtom, "dark");

    render(
      <KumixKeyValueProvider value={createMemoryKeyValue()}>
        <JotaiProvider store={store}>
          <ThemeProvider>
            <div />
          </ThemeProvider>
        </JotaiProvider>
      </KumixKeyValueProvider>,
    );

    expect(document.documentElement.classList.contains("theme")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
