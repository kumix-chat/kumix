import type { MatrixClientEvent, MatrixClientPort } from "@kumix/client-core";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useKumixMatrixAdapter } from "../../../app/ports/MatrixProvider";
import type { MatrixSyncState } from "../state/matrix.atoms";
import {
  matrixAccessTokenAtom,
  matrixEventCountAtom,
  matrixHomeserverUrlAtom,
  matrixLastEventAtom,
  matrixSyncStateAtom,
} from "../state/matrix.atoms";

export type MatrixVm = {
  state: {
    homeserverUrl: string;
    accessToken: string;
    syncState: MatrixSyncState;
    eventCount: number;
    lastEvent: string;
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
  const eventCount = useAtomValue(matrixEventCountAtom);
  const setEventCount = useSetAtom(matrixEventCountAtom);
  const lastEvent = useAtomValue(matrixLastEventAtom);
  const setLastEvent = useSetAtom(matrixLastEventAtom);

  const options = useMemo(
    () => ({ homeserverUrl, accessToken: accessToken.length > 0 ? accessToken : undefined }),
    [accessToken, homeserverUrl],
  );

  const clientRef = useRef<MatrixClientPort | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      clientRef.current?.stopSync().catch(() => {});
      clientRef.current = null;
    };
  }, []);

  const onClientEvent = useCallback(
    (event: MatrixClientEvent) => {
      setEventCount((value) => value + 1);
      setLastEvent(event.type);
      if (event.type === "sync.error") setSyncState({ kind: "error", message: event.message });
    },
    [setEventCount, setLastEvent, setSyncState],
  );

  const start = useCallback(async () => {
    if (syncState.kind === "running" || syncState.kind === "starting") return;

    try {
      setSyncState({ kind: "starting" });
      const client = matrix.createClient(options);
      clientRef.current = client;
      unsubscribeRef.current?.();
      unsubscribeRef.current = client.subscribe(onClientEvent);
      await client.startSync();
      setSyncState({ kind: "running" });
    } catch (error) {
      setSyncState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, [matrix, onClientEvent, options, setSyncState, syncState.kind]);

  const stop = useCallback(async () => {
    try {
      await clientRef.current?.stopSync();
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
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
    state: { homeserverUrl, accessToken, syncState, eventCount, lastEvent },
    actions: {
      setHomeserverUrl: (value) => setHomeserverUrl(value),
      setAccessToken: (value) => setAccessToken(value),
      start,
      stop,
    },
  };
}
