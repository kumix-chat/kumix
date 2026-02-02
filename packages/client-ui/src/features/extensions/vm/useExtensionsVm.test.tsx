import type { KeyValuePort } from "@kumix/client-core";
import type { BundledProcExtension, BundledUiExtension } from "@kumix/plugin";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai";
import { createStore } from "jotai/vanilla";
import { afterEach, describe, expect, it } from "vitest";
import { useExtensionsVm } from "./useExtensionsVm";

class MemoryKeyValue implements KeyValuePort {
  #items = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.#items.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.#items.set(key, value);
  }

  peek(key: string): string | null {
    return this.#items.get(key) ?? null;
  }
}

const EXTENSIONS_ENABLED_KEY = "kumix.extensions.enabled.v1";

const getExtensionsStub = (): { ui: BundledUiExtension[]; proc: BundledProcExtension[] } => ({
  ui: [
    {
      kind: "ui",
      manifest: {
        id: "github-panel",
        name: "GitHub Panel",
        version: "0.0.1",
        capabilities: ["unfurl"],
      },
      html: "<!doctype html><html><body>stub</body></html>",
    },
  ],
  proc: [],
});

function Harness(props: { keyValue: MemoryKeyValue }) {
  const vm = useExtensionsVm({
    getExtensions: getExtensionsStub,
    keyValue: props.keyValue,
  });
  return (
    <div>
      <div data-testid="enabled">{vm.state.enabledKeys.join(",")}</div>
      <button type="button" onClick={() => vm.actions.setEnabled("ui:github-panel", false)}>
        disable
      </button>
      <button type="button" onClick={() => vm.actions.setEnabled("ui:github-panel", true)}>
        enable
      </button>
    </div>
  );
}

describe("useExtensionsVm", () => {
  afterEach(() => {
    cleanup();
  });

  it("initializes enabled keys from registry on first run", async () => {
    const keyValue = new MemoryKeyValue();
    const store = createStore();

    render(
      <JotaiProvider store={store}>
        <Harness keyValue={keyValue} />
      </JotaiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("ui:github-panel");
    });

    expect(keyValue.peek(EXTENSIONS_ENABLED_KEY)).toBe(JSON.stringify(["ui:github-panel"]));
  });

  it("toggles enable/disable", async () => {
    const keyValue = new MemoryKeyValue();
    const store = createStore();

    render(
      <JotaiProvider store={store}>
        <Harness keyValue={keyValue} />
      </JotaiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("ui:github-panel");
    });

    fireEvent.click(screen.getByRole("button", { name: "disable" }));
    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("");
    });

    fireEvent.click(screen.getByRole("button", { name: "enable" }));
    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("ui:github-panel");
    });
  });
});
