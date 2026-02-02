import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider as JotaiProvider } from "jotai"
import { createStore } from "jotai/vanilla"
import { describe, expect, it } from "vitest"
import { useExtensionsVm } from "./useExtensionsVm"

class MemoryStorage {
  #items = new Map<string, string>()

  getItem(key: string): string | null {
    return this.#items.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.#items.set(key, value)
  }

  peek(key: string): string | null {
    return this.#items.get(key) ?? null
  }
}

const EXTENSIONS_ENABLED_KEY = "kumix.extensions.enabled.v1"

const getExtensionsStub = () => ({
  ui: [
    {
      kind: "ui" as const,
      manifest: { id: "github-panel", name: "GitHub Panel", version: "0.1.0", capabilities: ["unfurl"] as const },
      html: "<!doctype html><html><body>stub</body></html>"
    }
  ],
  proc: []
})

function Harness(props: { storage: MemoryStorage }) {
  const vm = useExtensionsVm({ getExtensions: getExtensionsStub as any, storage: props.storage as any })
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
  )
}

describe("useExtensionsVm", () => {
  it("initializes enabled keys from registry on first run", async () => {
    const storage = new MemoryStorage()
    const store = createStore()

    render(
      <JotaiProvider store={store}>
        <Harness storage={storage} />
      </JotaiProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("ui:github-panel")
    })

    expect(storage.peek(EXTENSIONS_ENABLED_KEY)).toBe(JSON.stringify(["ui:github-panel"]))
  })

  it("toggles enable/disable", async () => {
    const storage = new MemoryStorage()
    const store = createStore()

    render(
      <JotaiProvider store={store}>
        <Harness storage={storage} />
      </JotaiProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("ui:github-panel")
    })

    fireEvent.click(screen.getByRole("button", { name: "disable" }))
    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("")
    })

    fireEvent.click(screen.getByRole("button", { name: "enable" }))
    await waitFor(() => {
      expect(screen.getByTestId("enabled").textContent).toBe("ui:github-panel")
    })
  })
})

