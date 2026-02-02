# End-to-end encryption

Kumix aims to support Matrix E2EE (Olm/Megolm) while keeping the UI code independent from the SDK.

This document describes the intended boundaries and storage rules for v0.0.x.

## Status

- v0.0.1: No real E2EE wiring yet (adapter is minimal).
- v0.0.x goal: Define boundaries + secure storage strategy first, then wire E2EE in `@kumix/matrix-adapter`.

## Boundaries (where E2EE lives)

- `packages/client-ui`: never imports `matrix-js-sdk` directly.
- `packages/client-core`: defines the port interfaces and domain/state rules.
- `packages/matrix-adapter`: owns `matrix-js-sdk` initialization, crypto bootstrap, and event mapping.

## Key material storage

Kumix has two runtime targets:

- Web: browser storage (IndexedDB) + optional webcrypto-based wrapping
- Desktop (Tauri): OS keychain + SQLite (for non-secret data)

### What is considered secret

- access tokens
- cross-signing keys
- device keys / session keys
- any private crypto material used by Matrix SDK

### Desktop (Tauri)

Preferred approach:

- Secrets: OS keychain (Tauri plugin)
- Non-secrets: SQLite (already used for `KeyValuePort` in v0.0.1)

### Web

MVP approach:

- Use IndexedDB for SDK crypto store
- If possible, wrap sensitive blobs using WebCrypto (derived key from user-provided passphrase)

## Operational notes

- E2EE must be opt-in at runtime until the storage strategy is complete.
- Never store tokens/keys in plain localStorage.

