import { createProcWorkerClient, getBundledExtensions } from "@kumix/plugin"
import { useAtomValue, useSetAtom } from "jotai"
import type { RefObject } from "react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import {
  extensionsEnabledKeysAtom,
  extensionsMarkdownSourceAtom,
  extensionsMermaidSourceAtom,
  extensionsProcStateAtom,
  extensionsRenderedHtmlAtom,
  extensionsSelectedProcIdAtom,
  extensionsSelectedUiIdAtom
} from "../state/extensions.atoms"
import type { ExtensionKey, ProcFormat, ProcState } from "../state/extensions.types"

const EXTENSIONS_ENABLED_KEY = "kumix.extensions.enabled.v1"

function isExtensionKey(value: unknown): value is ExtensionKey {
  return typeof value === "string" && (value.startsWith("ui:") || value.startsWith("proc:"))
}

function parseEnabledKeys(raw: string | null): ExtensionKey[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.filter(isExtensionKey)
  } catch {
    return null
  }
}

export type ExtensionsVmOptions = {
  getExtensions?: typeof getBundledExtensions
  storage?: Pick<Storage, "getItem" | "setItem">
}

export type ExtensionsVm = {
  refs: {
    iframeRef: RefObject<HTMLIFrameElement>
  }
  state: {
    ui: ReturnType<typeof getBundledExtensions>["ui"]
    proc: ReturnType<typeof getBundledExtensions>["proc"]
    enabledKeys: ExtensionKey[]
    enabledUi: ReturnType<typeof getBundledExtensions>["ui"]
    enabledProc: ReturnType<typeof getBundledExtensions>["proc"]
    selectedUiId: string
    selectedProcId: string
    selectedUi: ReturnType<typeof getBundledExtensions>["ui"][number] | null
    selectedProc: ReturnType<typeof getBundledExtensions>["proc"][number] | null
    procFormat: ProcFormat
    editorValue: string
    renderedHtml: string
    procState: ProcState
  }
  actions: {
    setEnabled(key: ExtensionKey, enabled: boolean): void
    selectUi(id: string): void
    selectProc(id: string): void
    setEditorValue(value: string): void
    render(): Promise<void>
  }
}

export function useExtensionsVm(options: ExtensionsVmOptions = {}): ExtensionsVm {
  const storage = options.storage ?? (typeof window !== "undefined" ? window.localStorage : undefined)
  const getExtensions = options.getExtensions ?? getBundledExtensions

  const bundled = useMemo(() => getExtensions(), [getExtensions])
  const ui = bundled.ui
  const proc = bundled.proc

  const allKeys = useMemo<ExtensionKey[]>(
    () => [
      ...ui.map((ext) => `ui:${ext.manifest.id}` as const),
      ...proc.map((ext) => `proc:${ext.manifest.id}` as const)
    ],
    [ui, proc]
  )

  const enabledKeysValue = useAtomValue(extensionsEnabledKeysAtom)
  const setEnabledKeys = useSetAtom(extensionsEnabledKeysAtom)

  useEffect(() => {
    if (!storage) return
    if (enabledKeysValue !== null) return

    const raw = storage.getItem(EXTENSIONS_ENABLED_KEY)
    const parsed = parseEnabledKeys(raw)
    const normalized = (parsed ?? allKeys).filter((key) => allKeys.includes(key))
    setEnabledKeys(normalized)
    storage.setItem(EXTENSIONS_ENABLED_KEY, JSON.stringify(normalized))
  }, [allKeys, enabledKeysValue, setEnabledKeys, storage])

  const enabledKeys = enabledKeysValue ?? []
  const enabledKeySet = useMemo(() => new Set(enabledKeys), [enabledKeys])

  useEffect(() => {
    if (!storage) return
    if (enabledKeysValue === null) return
    storage.setItem(EXTENSIONS_ENABLED_KEY, JSON.stringify(enabledKeysValue))
  }, [enabledKeysValue, storage])

  const enabledUi = useMemo(() => ui.filter((ext) => enabledKeySet.has(`ui:${ext.manifest.id}`)), [enabledKeySet, ui])
  const enabledProc = useMemo(
    () => proc.filter((ext) => enabledKeySet.has(`proc:${ext.manifest.id}`)),
    [enabledKeySet, proc]
  )

  const selectedUiId = useAtomValue(extensionsSelectedUiIdAtom)
  const setSelectedUiId = useSetAtom(extensionsSelectedUiIdAtom)
  const selectedProcId = useAtomValue(extensionsSelectedProcIdAtom)
  const setSelectedProcId = useSetAtom(extensionsSelectedProcIdAtom)

  useEffect(() => {
    if (enabledUi.length === 0) {
      if (selectedUiId) setSelectedUiId("")
      return
    }
    if (!enabledUi.some((ext) => ext.manifest.id === selectedUiId)) {
      setSelectedUiId(enabledUi[0].manifest.id)
    }
  }, [enabledUi, selectedUiId, setSelectedUiId])

  useEffect(() => {
    if (enabledProc.length === 0) {
      if (selectedProcId) setSelectedProcId("")
      return
    }
    if (!enabledProc.some((ext) => ext.manifest.id === selectedProcId)) {
      setSelectedProcId(enabledProc[0].manifest.id)
    }
  }, [enabledProc, selectedProcId, setSelectedProcId])

  const selectedUi = useMemo(
    () => enabledUi.find((ext) => ext.manifest.id === selectedUiId) ?? null,
    [enabledUi, selectedUiId]
  )
  const selectedProc = useMemo(
    () => enabledProc.find((ext) => ext.manifest.id === selectedProcId) ?? null,
    [enabledProc, selectedProcId]
  )

  const procFormat: ProcFormat = useMemo(() => {
    const caps = selectedProc?.manifest.capabilities ?? []
    return caps.includes("render.mermaid") ? "mermaid" : "markdown"
  }, [selectedProc?.manifest.capabilities])

  const markdownSource = useAtomValue(extensionsMarkdownSourceAtom)
  const setMarkdownSource = useSetAtom(extensionsMarkdownSourceAtom)
  const mermaidSource = useAtomValue(extensionsMermaidSourceAtom)
  const setMermaidSource = useSetAtom(extensionsMermaidSourceAtom)
  const renderedHtml = useAtomValue(extensionsRenderedHtmlAtom)
  const setRenderedHtml = useSetAtom(extensionsRenderedHtmlAtom)
  const procState = useAtomValue(extensionsProcStateAtom)
  const setProcState = useSetAtom(extensionsProcStateAtom)

  const editorValue = procFormat === "mermaid" ? mermaidSource : markdownSource

  const iframeRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return
      const msg = event.data as any
      if (!msg || typeof msg !== "object") return
      if (msg.type === "ping" && typeof msg.id === "string") {
        iframeRef.current?.contentWindow?.postMessage({ type: "pong", id: msg.id }, "*")
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const procClientRef = useRef<ReturnType<typeof createProcWorkerClient> | null>(null)
  useEffect(() => {
    setRenderedHtml("")
    procClientRef.current?.dispose()
    procClientRef.current = null

    if (!selectedProc) {
      setProcState({ kind: "idle" })
      return
    }

    const worker = selectedProc.createWorker()
    const client = createProcWorkerClient(worker, { timeoutMs: selectedProc.manifest.timeoutMs })
    procClientRef.current = client
    let cancelled = false

    client
      .ping()
      .then(() => {
        if (!cancelled) setProcState({ kind: "ready" })
      })
      .catch((error) => {
        if (!cancelled) {
          setProcState({ kind: "error", message: error instanceof Error ? error.message : String(error) })
        }
      })

    return () => {
      cancelled = true
      procClientRef.current?.dispose()
      procClientRef.current = null
    }
  }, [selectedProc, setProcState, setRenderedHtml])

  const setEnabled = useCallback(
    (key: ExtensionKey, enabled: boolean) => {
      const base = enabledKeysValue ?? []
      const next = new Set(base)
      if (enabled) next.add(key)
      else next.delete(key)
      setEnabledKeys([...next].sort())
    },
    [enabledKeysValue, setEnabledKeys]
  )

  const setEditorValue = useCallback(
    (value: string) => {
      if (procFormat === "mermaid") setMermaidSource(value)
      else setMarkdownSource(value)
    },
    [procFormat, setMarkdownSource, setMermaidSource]
  )

  const render = useCallback(async () => {
    const client = procClientRef.current
    if (!client || !selectedProc) return

    try {
      setProcState({ kind: "rendering" })
      const source = procFormat === "mermaid" ? mermaidSource : markdownSource
      const html = procFormat === "mermaid" ? await client.renderMermaid(source) : await client.renderMarkdown(source)
      setRenderedHtml(html)
      setProcState({ kind: "ready" })
    } catch (error) {
      setProcState({ kind: "error", message: error instanceof Error ? error.message : String(error) })
    }
  }, [markdownSource, mermaidSource, procFormat, selectedProc, setProcState, setRenderedHtml])

  return {
    refs: { iframeRef },
    state: {
      ui,
      proc,
      enabledKeys,
      enabledUi,
      enabledProc,
      selectedUiId,
      selectedProcId,
      selectedUi,
      selectedProc,
      procFormat,
      editorValue,
      renderedHtml,
      procState
    },
    actions: {
      setEnabled,
      selectUi: (id) => setSelectedUiId(id),
      selectProc: (id) => setSelectedProcId(id),
      setEditorValue,
      render
    }
  }
}
