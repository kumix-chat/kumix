export type WorkspaceId = string
export type CollectionId = string
export type RoomId = string

export type Workspace = {
  id: WorkspaceId
  name: string
}

export type Collection = {
  id: CollectionId
  workspaceId: WorkspaceId
  name: string
}

export type Room = {
  id: RoomId
  workspaceId: WorkspaceId
  name: string
}

