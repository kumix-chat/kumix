export type MatrixClientOptions = {
  homeserverUrl: string;
  accessToken?: string;
};

export interface MatrixClientPort {
  startSync(): Promise<void>;
  stopSync(): Promise<void>;
}

export interface MatrixAdapterPort {
  createClient(options: MatrixClientOptions): MatrixClientPort;
}
