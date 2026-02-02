# Threat model

This is a lightweight threat model for Kumix v0.0.1–v0.0.x.

Kumix runs a governed extension system:

- UI extensions: sandboxed iframes (currently `srcdoc`, origin `null`)
- Proc extensions: Web Workers (optionally with WASM)

## Assets to protect

- Matrix credentials and E2EE key material
- User content (messages, files, metadata)
- Local state (settings, enabled extensions, cached data)
- Availability (avoid local DoS by extensions)

## Trust boundaries

- Host app (Kumix) is trusted.
- Bundled extensions are trusted by provenance but must still be constrained by policy.
- External extensions (future) must be treated as untrusted.

## Major attack surfaces

### UI extensions (iframe, `srcdoc`)

Risks:

- postMessage spoofing
- unexpected navigation / popup abuse
- exfiltration via network requests (if permitted)

Mitigations in v0.0.1:

- Policy enforcement (capabilities/origins) in `packages/plugin`
- Token handshake for the bridge
- `sandbox` is applied to iframes (scripts allowed; other flags are reviewed per policy)

Open questions / next hardening:

- CSP alignment for `srcdoc`
- Network egress controls (web is hard; desktop can be stricter)

### Proc extensions (Web Worker)

Risks:

- CPU/memory DoS by heavy inputs or infinite loops
- large outputs (HTML) causing UI memory pressure
- crashes leaving dangling pending requests

Mitigations in v0.0.1:

- Timeout per extension (manifest + policy caps)
- Input/output size limits (policy)
- Crash converts into a terminal error for pending requests

### WASM inside workers

Risks:

- high CPU usage
- unexpected imports/exports usage

Mitigations:

- WASM is loaded from bundled assets only
- Host limits still apply (timeout, payload limits)

## Policy model (governance)

Policy is a *deny by default* mechanism in strict mode:

- `capabilities`: allowed actions
- `pluginOrigins`: allowed UI origins (`null` for srcdoc)
- `proc.*`: runtime resource limits

## Non-goals (for v0.0.x)

- Full sandboxing/containment equivalent to OS-level isolation
- Remote extension registry security model (signing, reputation, etc.)

