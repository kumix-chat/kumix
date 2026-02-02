import type { MatrixAdapterPort, MatrixClientOptions, MatrixClientPort } from "@kumix/client-core";

export type { MatrixClientOptions, MatrixClientPort } from "@kumix/client-core";

export function createMatrixClient(_options: MatrixClientOptions): MatrixClientPort {
  return {
    async startSync() {
      // TODO: wire matrix-js-sdk
    },
    async stopSync() {
      // TODO
    },
  };
}

export const matrixAdapter: MatrixAdapterPort = {
  createClient: createMatrixClient,
};
