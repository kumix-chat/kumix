import type { MatrixClientPort } from "@kumix/client-core";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useKumixMatrixAdapter } from "../../../app/ports/MatrixProvider";
import type { MatrixSyncState } from "../state/matrix.atoms";
import {
  matrixAccessTokenAtom,
  matrixHomeserverUrlAtom,
  matrixSyncStateAtom,
} from "../state/matrix.atoms";

export type MatrixVm = {
  state: {
    homeserverUrl: string;
    accessToken: string;
    syncState: MatrixSyncState;
  };
  actions: {
    setHomeserverUrl(value: string): void;
    setAccessToken(value: string): void;
    start(): Promise<void>;
    stop(): Promise<void>;
  };
};

export function useMatrixVm(): MatrixVm {
  const matrix = useKumixMatrixAdapter();

  const homeserverUrl = useAtomValue(matrixHomeserverUrlAtom);
  const setHomeserverUrl = useSetAtom(matrixHomeserverUrlAtom);
  const accessToken = useAtomValue(matrixAccessTokenAtom);
  const setAccessToken = useSetAtom(matrixAccessTokenAtom);
  const syncState = useAtomValue(matrixSyncStateAtom);
  const setSyncState = useSetAtom(matrixSyncStateAtom);

  const options = useMemo(
    () => ({ homeserverUrl, accessToken: accessToken.length > 0 ? accessToken : undefined }),
    [accessToken, homeserverUrl],
  );

  const clientRef = useRef<MatrixClientPort | null>(null);

  useEffect(() => {
    return () => {
      clientRef.current?.stopSync().catch(() => {});
      clientRef.current = null;
    };
  }, []);

  const start = useCallback(async () => {
    if (syncState.kind === "running" || syncState.kind === "starting") return;

    try {
      setSyncState({ kind: "starting" });
      const client = matrix.createClient(options);
      clientRef.current = client;
      await client.startSync();
      setSyncState({ kind: "running" });
    } catch (error) {
      setSyncState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, [matrix, options, setSyncState, syncState.kind]);

  const stop = useCallback(async () => {
    try {
      await clientRef.current?.stopSync();
      clientRef.current = null;
      setSyncState({ kind: "stopped" });
    } catch (error) {
      setSyncState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, [setSyncState]);

  return {
    state: { homeserverUrl, accessToken, syncState },
    actions: {
      setHomeserverUrl: (value) => setHomeserverUrl(value),
      setAccessToken: (value) => setAccessToken(value),
      start,
      stop,
    },
  };
}
