# Architecture

This repo is a scaffold with an explicit layering and state management policy.

## Layers

- `apps/web`: Vite + React entrypoint (wires providers + router)
- `apps/desktop`: Tauri entrypoint (same UI as web + Rust backend)
- `packages/client-ui`: app shell, router, feature views and VMs (apps should stay thin)
- `packages/ui`: shared component layer (IntentUI-style; safe place to vendor IntentUI components)
- `packages/client-core`: domain/usecases/ports (no UI)
- `packages/plugin`: extension discovery + proc worker client

## State (Jotai only)

- State management is **Jotai only**. Do not add Zustand back.
- Atom placement:
  - App-wide: `packages/client-ui/src/app/state/*`
  - Feature-local: `packages/client-ui/src/features/<feature>/state/*`
- Naming:
  - `fooAtom`: source atom
  - `fooDerivedAtom`: read-only derived atom
  - `fooActionAtom`: write-only atom (actions)

## MVVM rule

- View (`ui/`): render only (no I/O, no global side effects)
- VM (`vm/`): state orchestration, effects, I/O (localStorage, plugin, matrix, storage, tauri)
- State (`state/`): atoms + types

Rule of thumb: Views should not import atoms directly. Views call `useXxxVm()` and render `vm.state` + `vm.actions`.

## Providers

Apps should wrap the router with `KumixAppProviders` (QueryClient + I18n + Jotai store) and avoid duplicating
provider wiring per app.
