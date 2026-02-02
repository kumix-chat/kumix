import type { MatrixAdapterPort, MatrixClientEvent } from "@kumix/client-core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider as JotaiProvider } from "jotai";
import { createStore } from "jotai/vanilla";
import { describe, expect, it } from "vitest";
import { KumixMatrixAdapterProvider } from "../../../app/ports/MatrixProvider";
import { useMatrixVm } from "./useMatrixVm";

const matrixAdapterStub: MatrixAdapterPort = {
  createClient() {
    const listeners = new Set<(event: MatrixClientEvent) => void>();
    return {
      subscribe(handler) {
        listeners.add(handler);
        return () => listeners.delete(handler);
      },
      async startSync() {},
      async stopSync() {},
    };
  },
};

function Harness() {
  const vm = useMatrixVm();
  return (
    <div>
      <div data-testid="state">{vm.state.syncState.kind}</div>
      <button type="button" onClick={() => void vm.actions.start()}>
        start
      </button>
      <button type="button" onClick={() => void vm.actions.stop()}>
        stop
      </button>
    </div>
  );
}

describe("useMatrixVm", () => {
  it("starts and stops sync", async () => {
    const store = createStore();

    render(
      <KumixMatrixAdapterProvider value={matrixAdapterStub}>
        <JotaiProvider store={store}>
          <Harness />
        </JotaiProvider>
      </KumixMatrixAdapterProvider>,
    );

    expect(screen.getByTestId("state").textContent).toBe("stopped");

    fireEvent.click(screen.getByRole("button", { name: "start" }));
    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe("running");
    });

    fireEvent.click(screen.getByRole("button", { name: "stop" }));
    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe("stopped");
    });
  });
});
