import type { KeyValuePort } from "@kumix/client-core";
import { createBrowserLocalStorageKeyValue } from "./keyValue";

type Invoke = (command: string, args?: Record<string, unknown>) => Promise<unknown>;
type IsTauri = () => boolean;

export type DesktopSqliteKeyValueOptions = {
  invoke?: Invoke;
  isTauri?: IsTauri;
  fallback?: KeyValuePort;
};

export class DesktopSqliteKeyValue implements KeyValuePort {
  #fallback: KeyValuePort;
  #invoke?: Invoke;
  #isTauri?: IsTauri;

  constructor(options: DesktopSqliteKeyValueOptions = {}) {
    this.#fallback = options.fallback ?? createBrowserLocalStorageKeyValue();
    this.#invoke = options.invoke;
    this.#isTauri = options.isTauri;
  }

  async get(key: string): Promise<string | null> {
    const core = this.#getCore();
    if (!core || !core.isTauri()) return this.#fallback.get(key);

    const value = await core.invoke("kv_get", { key });
    if (value == null) return null;
    if (typeof value === "string") return value;
    return String(value);
  }

  async set(key: string, value: string): Promise<void> {
    const core = this.#getCore();
    if (!core || !core.isTauri()) return this.#fallback.set(key, value);

    await core.invoke("kv_set", { key, value });
  }

  #getCore(): { invoke: Invoke; isTauri: IsTauri } | null {
    if (!this.#invoke || !this.#isTauri) return null;
    return { invoke: this.#invoke, isTauri: this.#isTauri };
  }
}

export function createDesktopSqliteKeyValue(options?: DesktopSqliteKeyValueOptions): KeyValuePort {
  return new DesktopSqliteKeyValue(options);
}
