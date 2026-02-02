# Workspace / Collections / Rooms

This doc defines the intended mapping between Kumix concepts and Matrix concepts.

## Concepts

- **Workspace**: a top-level context a user switches between.
- **Collection**: a grouping within a workspace.
- **Room**: a conversation or content channel.

## MVP mapping (v0.0.x)

Kumix starts with the simplest mapping:

- Workspace ≈ Matrix account + homeserver (login context)
- Room ≈ Matrix room
- Collection ≈ Matrix space (optional)

## Notes

- Matrix spaces are not required for Kumix to function.
- Kumix may allow multiple workspaces (multiple homeservers or accounts) in the future.
- Feature slices should depend on `client-core` ports, not directly on Matrix SDK primitives.

