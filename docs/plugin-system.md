# Plugin system

This repo uses **bundled extensions** (1st-party) that are discovered at build time.

## Kinds

- UI extensions: `extensions/ui/<id>/`
  - `manifest.json`
  - `entry.html` (loaded into an iframe via `srcDoc`)
- Proc extensions: `extensions/proc/<id>/`
  - `manifest.json`
  - `worker.ts` (loaded as a Web Worker)
  - optional `wasm/*` (WASM assets or bytecode helpers used by the worker)

## Discovery

`@kumix/plugin` discovers extensions at build time via Vite's `import.meta.glob` (no runtime directory scanning in the
browser). Adding/removing an extension requires rebuilding the client.

The directory name must match `manifest.json`'s `id`.

## Manifests (minimal)

UI (`extensions/ui/*/manifest.json`):

- `id`, `name`, `version`
- `capabilities`: list of declared capabilities

Proc (`extensions/proc/*/manifest.json`):

- `id`, `name`, `version`
- `capabilities`
- `timeoutMs` (optional): timeout used by the host worker client

## Enable / disable

The demo UI at `/extensions` allows toggling extensions on/off. The state is stored in localStorage under
`kumix.extensions.enabled.v1`.

## Messaging

- UI: iframe `postMessage` ping/pong demo (host validates `event.source`)
- Proc: request/response over worker `postMessage` (`ping`, `render.*`)

## WASM

Proc extensions can use WASM inside the worker. This repo provides a helper in `@kumix/plugin-sdk`:

- `instantiateWasm(source, imports?)` where `source` can be `Uint8Array` / `ArrayBuffer` / `URL` / `string`

See the sample extension at `extensions/proc/wasm-demo/`.
