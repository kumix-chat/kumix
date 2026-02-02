# kumix

Monorepo scaffold for:

- `apps/web`: React SPA (Vite) with TanStack Router
- `apps/desktop`: Tauri v2 app (web frontend + Rust backend)
- `packages/*`: shared libraries (UI, core, adapters, storage, etc.)

## Requirements

- Node.js (LTS recommended)
- bun
- (Desktop) Rust toolchain + platform dependencies for Tauri

## Quick start

```sh
bun install
bun run dev:web
```

## Desktop

```sh
bun run dev:desktop
```

Desktop uses the same UI as web and demonstrates IPC by invoking `greet` from Rust (`apps/desktop/src-tauri/src/main.rs`).

## Lint / format

- JS/TS (excluding `apps/desktop`): `bun run lint` / `bun run format`
- Rust (Tauri backend): `bun run lint:rust` / `bun run format:rust`

## i18n (Lingui)

- Language switcher is in the app header (locales: `en`, `ja`)
- Catalogs live in `packages/client-ui/src/locales`
- Extract/compile: `bun run i18n:extract` / `bun run i18n:compile`

## Tests

- JS/TS (web + desktop + packages): `bun run test` (or `bun run test:web`, `bun run test:desktop`, `bun run test:packages`)
- Rust (Tauri backend): `bun run test:rust`

## Web stack

- Routing: TanStack Router (shared in `packages/client-ui`)
- Data: TanStack Query + Table + Virtual (demo at `/data`)
- Styling: Tailwind CSS
- State: Jotai (demo in the Home page)
- i18n: LinguiJS (demo: switch language in header)
- UI: `packages/ui` is the shared component layer (IntentUI-style; safe place to vendor IntentUI components)

## Extensions

Open `/extensions` to see bundled extension demos:

- UI extensions (`extensions/ui/*`): sandboxed iframes (postMessage)
- Proc extensions (`extensions/proc/*`): Web Workers (request/response)
- Enable/disable is demoed in-app (stored in localStorage)

## IntentUI

IntentUI is typically installed via the `shadcn` CLI (it vendors components into your repo). If you want to switch
`packages/ui` to real IntentUI components:

```sh
bunx shadcn@latest init @intentui/theme-default
bunx shadcn@latest add @intentui/button @intentui/card @intentui/text-field
```
