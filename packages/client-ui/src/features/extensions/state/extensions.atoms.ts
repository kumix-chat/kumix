import { atom } from "jotai"
import type { ExtensionKey, ProcState } from "./extensions.types"

export const extensionsEnabledKeysAtom = atom<ExtensionKey[] | null>(null)
export const extensionsSelectedUiIdAtom = atom<string>("")
export const extensionsSelectedProcIdAtom = atom<string>("")

export const extensionsMarkdownSourceAtom = atom<string>("# kumix\n\nThis is a markdown renderer demo.\n")
export const extensionsMermaidSourceAtom = atom<string>(
  "graph TD\n  A[Start] --> B{Choice}\n  B -->|Yes| C[OK]\n  B -->|No| D[Retry]\n"
)

export const extensionsRenderedHtmlAtom = atom<string>("")
export const extensionsProcStateAtom = atom<ProcState>({ kind: "idle" })

