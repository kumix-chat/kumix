import type { StoragePort, WorkspaceSnapshot } from "@kumix/client-core"

const EMPTY: WorkspaceSnapshot = { workspaces: [], collections: [], rooms: [] }

export class MemoryStorage implements StoragePort {
  #snapshot: WorkspaceSnapshot = EMPTY

  async loadSnapshot(): Promise<WorkspaceSnapshot> {
    return this.#snapshot
  }

  async saveSnapshot(snapshot: WorkspaceSnapshot): Promise<void> {
    this.#snapshot = snapshot
  }
}

