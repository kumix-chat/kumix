export type MatrixClientOptions = {
  homeserverUrl: string
  accessToken?: string
}

export type MatrixClient = {
  startSync(): Promise<void>
  stopSync(): Promise<void>
}

export function createMatrixClient(_options: MatrixClientOptions): MatrixClient {
  return {
    async startSync() {
      // TODO: wire matrix-js-sdk
    },
    async stopSync() {
      // TODO
    }
  }
}

