import { fireEvent, render, screen } from "@testing-library/react"
import { Provider as JotaiProvider } from "jotai"
import { createStore } from "jotai/vanilla"
import { describe, expect, it } from "vitest"
import { useHomeVm } from "./useHomeVm"

function Harness() {
  const vm = useHomeVm()
  return (
    <div>
      <div data-testid="count">{vm.state.count}</div>
      <div data-testid="show">{String(vm.state.showMessage)}</div>
      <button type="button" onClick={() => vm.actions.increment()}>
        inc
      </button>
      <button type="button" onClick={() => vm.actions.showMessage()}>
        show
      </button>
    </div>
  )
}

describe("useHomeVm", () => {
  it("increments and toggles message", () => {
    const store = createStore()
    render(
      <JotaiProvider store={store}>
        <Harness />
      </JotaiProvider>
    )

    expect(screen.getByTestId("count").textContent).toBe("0")
    fireEvent.click(screen.getByRole("button", { name: "inc" }))
    expect(screen.getByTestId("count").textContent).toBe("1")

    expect(screen.getByTestId("show").textContent).toBe("false")
    fireEvent.click(screen.getByRole("button", { name: "show" }))
    expect(screen.getByTestId("show").textContent).toBe("true")
  })
})

