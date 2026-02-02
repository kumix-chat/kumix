import type { StoragePort, WorkspaceSnapshot } from "../ports/storage";

export async function loadWorkspaceSnapshot(storage: StoragePort): Promise<WorkspaceSnapshot> {
  return storage.loadSnapshot();
}
