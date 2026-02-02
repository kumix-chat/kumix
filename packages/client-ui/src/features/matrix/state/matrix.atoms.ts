import { defaultRuntimeConfig } from "@kumix/config";
import { atom } from "jotai";

export type MatrixSyncState =
  | { kind: "stopped" }
  | { kind: "starting" }
  | { kind: "running" }
  | { kind: "error"; message: string };

export const matrixHomeserverUrlAtom = atom<string>(defaultRuntimeConfig().homeserverUrl);
export const matrixAccessTokenAtom = atom<string>("");
export const matrixSyncStateAtom = atom<MatrixSyncState>({ kind: "stopped" });
