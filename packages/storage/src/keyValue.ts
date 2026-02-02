import type { KeyValuePort } from "@kumix/client-core";

export class MemoryKeyValue implements KeyValuePort {
  #items = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.#items.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.#items.set(key, value);
  }
}

export class BrowserLocalStorageKeyValue implements KeyValuePort {
  #storage: Pick<Storage, "getItem" | "setItem">;

  constructor(storage: Pick<Storage, "getItem" | "setItem">) {
    this.#storage = storage;
  }

  async get(key: string): Promise<string | null> {
    return this.#storage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    this.#storage.setItem(key, value);
  }
}

export function createBrowserLocalStorageKeyValue(
  storage: Pick<Storage, "getItem" | "setItem"> | undefined = typeof window !== "undefined"
    ? window.localStorage
    : undefined,
): KeyValuePort {
  if (!storage) return new MemoryKeyValue();
  return new BrowserLocalStorageKeyValue(storage);
}
