# Roadmap

## v0.0.1 (current)

- Bun monorepo scaffold (web + desktop)
- Feature slices with MVVM (Jotai)
- Governed extensions: UI (iframe) + Proc (worker/WASM)
- Policy enforcement (strict/dev)
- Minimal Matrix boundary (port + adapter stub)

## v0.0.2 (next)

- CI (Biome/TS/Vitest + Rust fmt/clippy/test)
- Infra quickstart (Synapse + Postgres compose)
- Matrix adapter: real `matrix-js-sdk` integration (token-only MVP)
- Manifest schema improvements (`kind` + basic entry metadata)
- Proc hardening (resource limits, crash behavior)

## v0.0.x goals (foundation complete)

- Fill docs (E2EE/threat model/workspace mapping)
- Tighten governance model (policy knobs, better validation)
- Expand Matrix port as needed (timeline/rooms) without leaking SDK into UI

## v0.1.0 (product work starts)

- Real workspace/collections model mapped onto Matrix
- Search + storage strategy (web/desktop split)
- UX improvements and production readiness
