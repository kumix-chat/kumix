export type MatrixClientOptions = {
  homeserverUrl: string;
  accessToken?: string;
};

export type MatrixClientEvent =
  | { type: "sync.started" }
  | { type: "sync.stopped" }
  | { type: "sync.error"; message: string };

export interface MatrixClientPort {
  startSync(): Promise<void>;
  stopSync(): Promise<void>;
  subscribe(handler: (event: MatrixClientEvent) => void): () => void;
}

export interface MatrixAdapterPort {
  createClient(options: MatrixClientOptions): MatrixClientPort;
}
