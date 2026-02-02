# Extensions

Bundled extensions are split into:

- `ui/`: sandboxed iframe apps
- `proc/`: worker-based processors

Notes:

- Extensions are discovered at build time from `extensions/**` (no runtime directory scanning in the browser).
- Enable/disable is demoed in the app at `/extensions` (stored in localStorage).
- Proc extensions may use WASM inside workers (see `proc/wasm-demo`).
