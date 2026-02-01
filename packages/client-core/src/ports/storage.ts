import type { Collection, Room, Workspace } from "../domain/models"

export type WorkspaceSnapshot = {
  workspaces: Workspace[]
  collections: Collection[]
  rooms: Room[]
}

export interface StoragePort {
  loadSnapshot(): Promise<WorkspaceSnapshot>
  saveSnapshot(snapshot: WorkspaceSnapshot): Promise<void>
}

