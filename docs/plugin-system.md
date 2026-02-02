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

The demo UI at `/extensions` allows toggling extensions on/off. The state is stored via a key-value port (default:
localStorage) under `kumix.extensions.enabled.v1`.

## Policies

Bundled policies live in `policies/defaults/` and are applied by `@kumix/plugin` at runtime.

- Select policy via `VITE_KUMIX_POLICY=dev|strict` (fallback: `development`/`test` => `dev`, otherwise `strict`)
- Extensions whose declared `capabilities` are not allowed by the active policy are filtered out of the registry
- UI extensions are loaded via `srcDoc` with `origin="null"`, so `pluginOrigins` must include `*` or `null` to allow them
- `policy.strict.json` is intended to be "usable by default": only a small allowlist is enabled (MVP: markdown/mermaid + demo UI)

## Messaging

- UI: iframe `postMessage` ping/pong demo using a host-injected bootstrap (`__KUMIX_UI_BOOTSTRAP__`)
- Proc: request/response over worker `postMessage` (`ping`, `render.*`)

VMs should treat `@kumix/plugin` as the only entry point and use the host APIs:

- `createSrcDocUiExtensionIntegration(extension)` (bootstrap + bridge)
- `createProcSessionForExtension(extension)` (worker session + policy enforcement)

### `srcDoc` targetOrigin

`srcDoc` iframes always use `origin="null"`. For the ping/pong handshake, the host replies with `postMessage(..., "*")`
and relies on `event.source` + token validation. If/when we support URL-based iframe extensions, the host can switch to a
strict `targetOrigin` derived from manifest/policy.

### `srcDoc` sandbox

UI extensions are loaded as sandboxed iframes. The current baseline sandbox attribute is:

- `allow-scripts allow-forms allow-modals allow-popups allow-downloads`

`allow-same-origin` is intentionally omitted to keep `origin="null"` for `srcDoc`.

## WASM

Proc extensions can use WASM inside the worker. This repo provides a helper in `@kumix/plugin-sdk`:

- `instantiateWasm(source, imports?)` where `source` can be `Uint8Array` / `ArrayBuffer` / `URL` / `string`

See the sample extension at `extensions/proc/wasm-demo/`.
