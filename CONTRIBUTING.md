# Contributing

Thanks for contributing to Kumix.

## Prerequisites

- Bun (see `.bun-version`)
- Rust (stable) + `cargo fmt` + `cargo clippy`

## Setup

- `bun install`

## Common commands

- `bun dev:web`
- `bun build:web`
- `bun test`
- `bun run check`
- `bun run lint`
- `bun run typecheck:web`
- `bun run typecheck:desktop`

Rust (Tauri backend):

- `bun format:rust`
- `bun lint:rust`
- `bun test:rust`

## Code organization

- Apps are thin: `apps/web`, `apps/desktop`
- Shared packages live in `packages/*`
- UI features live in `packages/client-ui/src/features/*` and follow `ui/ vm/ state/`
- Host integrations (extensions, policy) live in `packages/plugin`

## Style

- JavaScript/TypeScript formatting and linting: Biome (`bun run check`, `bun run lint`)
- Rust formatting: `cargo fmt`

## Pull requests

- Keep changes focused and small when possible.
- Add/update tests when changing behavior.
- Ensure `bun run test` and `bun run typecheck:web` pass.

