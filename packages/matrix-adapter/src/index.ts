import type {
  MatrixAdapterPort,
  MatrixClientEvent,
  MatrixClientOptions,
  MatrixClientPort,
} from "@kumix/client-core";
import {
  ClientEvent,
  createClient,
  type MatrixClient,
  type SyncState,
  type SyncStateData,
} from "matrix-js-sdk";

export type { MatrixClientOptions, MatrixClientPort } from "@kumix/client-core";

export function createMatrixClient(_options: MatrixClientOptions): MatrixClientPort {
  const options = _options;
  const listeners = new Set<(event: MatrixClientEvent) => void>();
  let client: MatrixClient | null = null;
  let running = false;
  let startedEmitted = false;

  function emit(event: MatrixClientEvent) {
    for (const listener of listeners) listener(event);
  }

  return {
    subscribe(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    async startSync() {
      if (running) return;
      if (!options.accessToken) throw new Error("Missing access token");
      if (!options.homeserverUrl) throw new Error("Missing homeserverUrl");

      client = createClient({
        baseUrl: options.homeserverUrl,
        accessToken: options.accessToken,
      });

      client.on(
        ClientEvent.Sync,
        (state: SyncState, _prevState: SyncState | null, data?: SyncStateData) => {
          if (state === "ERROR") {
            const err = data?.error as unknown;
            const message =
              err instanceof Error
                ? err.message
                : typeof err === "string"
                  ? err
                  : "Unknown sync error";
            emit({ type: "sync.error", message });
            return;
          }

          if (!startedEmitted && (state === "PREPARED" || state === "SYNCING")) {
            startedEmitted = true;
            emit({ type: "sync.started" });
          }
        },
      );

      client.on(ClientEvent.SyncUnexpectedError, (error: Error) => {
        emit({ type: "sync.error", message: error.message });
      });

      running = true;
      client.startClient({ initialSyncLimit: 10 });
    },
    async stopSync() {
      if (!running) return;
      running = false;
      startedEmitted = false;

      client?.stopClient();
      client = null;
      emit({ type: "sync.stopped" });
    },
  };
}

export const matrixAdapter: MatrixAdapterPort = {
  createClient: createMatrixClient,
};
