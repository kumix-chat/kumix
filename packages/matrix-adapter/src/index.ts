import type {
  MatrixAdapterPort,
  MatrixClientEvent,
  MatrixClientOptions,
  MatrixClientPort,
} from "@kumix/client-core";

export type { MatrixClientOptions, MatrixClientPort } from "@kumix/client-core";

export function createMatrixClient(_options: MatrixClientOptions): MatrixClientPort {
  const listeners = new Set<(event: MatrixClientEvent) => void>();
  let running = false;

  function emit(event: MatrixClientEvent) {
    for (const listener of listeners) listener(event);
  }

  return {
    subscribe(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    async startSync() {
      // TODO: wire matrix-js-sdk
      if (running) return;
      running = true;
      emit({ type: "sync.started" });
    },
    async stopSync() {
      // TODO
      if (!running) return;
      running = false;
      emit({ type: "sync.stopped" });
    },
  };
}

export const matrixAdapter: MatrixAdapterPort = {
  createClient: createMatrixClient,
};
