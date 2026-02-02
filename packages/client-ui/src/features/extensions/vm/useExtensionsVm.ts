import type { KeyValuePort } from "@kumix/client-core";
import {
  createProcSessionForExtension,
  createSrcDocUiExtensionIntegration,
  getBundledExtensions,
  type ProcExtensionSession,
  type SrcDocUiExtensionIntegration,
} from "@kumix/plugin";
import { useAtomValue, useSetAtom } from "jotai";
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useKumixKeyValue } from "../../../app/ports/KeyValueProvider";
import {
  extensionsEnabledKeysAtom,
  extensionsMarkdownSourceAtom,
  extensionsMermaidSourceAtom,
  extensionsProcStateAtom,
  extensionsRenderedHtmlAtom,
  extensionsSelectedProcIdAtom,
  extensionsSelectedUiIdAtom,
  extensionsUiStateAtom,
} from "../state/extensions.atoms";
import type { ExtensionKey, ProcFormat, ProcState, UiState } from "../state/extensions.types";

const EXTENSIONS_ENABLED_KEY = "kumix.extensions.enabled.v1";

function isExtensionKey(value: unknown): value is ExtensionKey {
  return typeof value === "string" && (value.startsWith("ui:") || value.startsWith("proc:"));
}

function parseEnabledKeys(raw: string | null): ExtensionKey[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isExtensionKey);
  } catch {
    return null;
  }
}

export type ExtensionsVmOptions = {
  getExtensions?: typeof getBundledExtensions;
  keyValue?: KeyValuePort;
};

export type ExtensionsVm = {
  refs: {
    iframeRef: RefObject<HTMLIFrameElement | null>;
  };
  state: {
    ui: ReturnType<typeof getBundledExtensions>["ui"];
    proc: ReturnType<typeof getBundledExtensions>["proc"];
    enabledKeys: ExtensionKey[];
    enabledUi: ReturnType<typeof getBundledExtensions>["ui"];
    enabledProc: ReturnType<typeof getBundledExtensions>["proc"];
    selectedUiId: string;
    selectedProcId: string;
    selectedUi: ReturnType<typeof getBundledExtensions>["ui"][number] | null;
    selectedUiSrcDoc: string;
    selectedUiIframe: { sandbox: string; referrerPolicy: ReferrerPolicy } | null;
    selectedProc: ReturnType<typeof getBundledExtensions>["proc"][number] | null;
    procFormat: ProcFormat;
    editorValue: string;
    renderedHtml: string;
    procState: ProcState;
    uiState: UiState;
  };
  actions: {
    setEnabled(key: ExtensionKey, enabled: boolean): void;
    selectUi(id: string): void;
    selectProc(id: string): void;
    setEditorValue(value: string): void;
    render(): Promise<void>;
  };
};

export function useExtensionsVm(options: ExtensionsVmOptions = {}): ExtensionsVm {
  const keyValueFromContext = useKumixKeyValue();
  const keyValue = useMemo(
    () => options.keyValue ?? keyValueFromContext,
    [options.keyValue, keyValueFromContext],
  );
  const getExtensions = options.getExtensions ?? getBundledExtensions;

  const bundled = useMemo(() => getExtensions(), [getExtensions]);
  const ui = bundled.ui;
  const proc = bundled.proc;

  const allKeys = useMemo<ExtensionKey[]>(
    () => [
      ...ui.map((ext) => `ui:${ext.manifest.id}` as const),
      ...proc.map((ext) => `proc:${ext.manifest.id}` as const),
    ],
    [ui, proc],
  );

  const enabledKeysValue = useAtomValue(extensionsEnabledKeysAtom);
  const setEnabledKeys = useSetAtom(extensionsEnabledKeysAtom);

  useEffect(() => {
    if (enabledKeysValue !== null) return;

    let cancelled = false;
    void (async () => {
      const raw = await keyValue.get(EXTENSIONS_ENABLED_KEY);
      const parsed = parseEnabledKeys(raw);
      const normalized = (parsed ?? allKeys).filter((key) => allKeys.includes(key));
      if (cancelled) return;
      setEnabledKeys(normalized);
      await keyValue.set(EXTENSIONS_ENABLED_KEY, JSON.stringify(normalized));
    })();

    return () => {
      cancelled = true;
    };
  }, [allKeys, enabledKeysValue, keyValue, setEnabledKeys]);

  const enabledKeys = enabledKeysValue ?? [];
  const enabledKeySet = useMemo(() => new Set(enabledKeys), [enabledKeys]);

  useEffect(() => {
    if (enabledKeysValue === null) return;
    void keyValue.set(EXTENSIONS_ENABLED_KEY, JSON.stringify(enabledKeysValue));
  }, [enabledKeysValue, keyValue]);

  const enabledUi = useMemo(
    () => ui.filter((ext) => enabledKeySet.has(`ui:${ext.manifest.id}`)),
    [enabledKeySet, ui],
  );
  const enabledProc = useMemo(
    () => proc.filter((ext) => enabledKeySet.has(`proc:${ext.manifest.id}`)),
    [enabledKeySet, proc],
  );

  const selectedUiId = useAtomValue(extensionsSelectedUiIdAtom);
  const setSelectedUiId = useSetAtom(extensionsSelectedUiIdAtom);
  const selectedProcId = useAtomValue(extensionsSelectedProcIdAtom);
  const setSelectedProcId = useSetAtom(extensionsSelectedProcIdAtom);

  useEffect(() => {
    if (enabledUi.length === 0) {
      if (selectedUiId) setSelectedUiId("");
      return;
    }
    if (!enabledUi.some((ext) => ext.manifest.id === selectedUiId)) {
      setSelectedUiId(enabledUi[0].manifest.id);
    }
  }, [enabledUi, selectedUiId, setSelectedUiId]);

  useEffect(() => {
    if (enabledProc.length === 0) {
      if (selectedProcId) setSelectedProcId("");
      return;
    }
    if (!enabledProc.some((ext) => ext.manifest.id === selectedProcId)) {
      setSelectedProcId(enabledProc[0].manifest.id);
    }
  }, [enabledProc, selectedProcId, setSelectedProcId]);

  const selectedUi = useMemo(
    () => enabledUi.find((ext) => ext.manifest.id === selectedUiId) ?? null,
    [enabledUi, selectedUiId],
  );
  const selectedProc = useMemo(
    () => enabledProc.find((ext) => ext.manifest.id === selectedProcId) ?? null,
    [enabledProc, selectedProcId],
  );

  const [uiIntegration, setUiIntegration] = useState<SrcDocUiExtensionIntegration | null>(null);
  const uiState = useAtomValue(extensionsUiStateAtom);
  const setUiState = useSetAtom(extensionsUiStateAtom);

  useEffect(() => {
    setUiIntegration(null);
    setUiState({ kind: "idle" });

    if (!selectedUi) return;
    try {
      const integration = createSrcDocUiExtensionIntegration(selectedUi);
      setUiIntegration(integration);
      setUiState({ kind: "ready" });
    } catch (error) {
      setUiState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, [selectedUi, setUiState]);

  const selectedUiSrcDoc = uiIntegration?.srcDoc ?? "";
  const selectedUiIframe = uiIntegration?.iframe ?? null;

  const procFormat: ProcFormat = useMemo(() => {
    const caps = selectedProc?.manifest.capabilities ?? [];
    return caps.includes("render.mermaid") ? "mermaid" : "markdown";
  }, [selectedProc?.manifest.capabilities]);

  const markdownSource = useAtomValue(extensionsMarkdownSourceAtom);
  const setMarkdownSource = useSetAtom(extensionsMarkdownSourceAtom);
  const mermaidSource = useAtomValue(extensionsMermaidSourceAtom);
  const setMermaidSource = useSetAtom(extensionsMermaidSourceAtom);
  const renderedHtml = useAtomValue(extensionsRenderedHtmlAtom);
  const setRenderedHtml = useSetAtom(extensionsRenderedHtmlAtom);
  const procState = useAtomValue(extensionsProcStateAtom);
  const setProcState = useSetAtom(extensionsProcStateAtom);

  const editorValue = procFormat === "mermaid" ? mermaidSource : markdownSource;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!uiIntegration) return;
    const bridge = uiIntegration.attach(() => iframeRef.current?.contentWindow ?? null);
    return () => bridge.dispose();
  }, [uiIntegration]);

  const procSessionRef = useRef<ProcExtensionSession | null>(null);
  useEffect(() => {
    setRenderedHtml("");
    procSessionRef.current?.dispose();
    procSessionRef.current = null;

    if (!selectedProc) {
      setProcState({ kind: "idle" });
      return;
    }

    const session = createProcSessionForExtension(selectedProc);
    procSessionRef.current = session;
    let cancelled = false;

    session.ready
      .then(() => {
        if (!cancelled) setProcState({ kind: "ready" });
      })
      .catch((error) => {
        if (!cancelled) {
          setProcState({
            kind: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });

    return () => {
      cancelled = true;
      procSessionRef.current?.dispose();
      procSessionRef.current = null;
    };
  }, [selectedProc, setProcState, setRenderedHtml]);

  const setEnabled = useCallback(
    (key: ExtensionKey, enabled: boolean) => {
      const base = enabledKeysValue ?? [];
      const next = new Set(base);
      if (enabled) next.add(key);
      else next.delete(key);
      setEnabledKeys([...next].sort());
    },
    [enabledKeysValue, setEnabledKeys],
  );

  const setEditorValue = useCallback(
    (value: string) => {
      if (procFormat === "mermaid") setMermaidSource(value);
      else setMarkdownSource(value);
    },
    [procFormat, setMarkdownSource, setMermaidSource],
  );

  const render = useCallback(async () => {
    const session = procSessionRef.current;
    if (!session || !selectedProc) return;

    try {
      setProcState({ kind: "rendering" });
      const source = procFormat === "mermaid" ? mermaidSource : markdownSource;
      const html =
        procFormat === "mermaid"
          ? await session.renderMermaid(source)
          : await session.renderMarkdown(source);
      setRenderedHtml(html);
      setProcState({ kind: "ready" });
    } catch (error) {
      setProcState({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, [markdownSource, mermaidSource, procFormat, selectedProc, setProcState, setRenderedHtml]);

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
      selectedUiSrcDoc,
      selectedUiIframe,
      selectedProc,
      procFormat,
      editorValue,
      renderedHtml,
      procState,
      uiState,
    },
    actions: {
      setEnabled,
      selectUi: (id) => setSelectedUiId(id),
      selectProc: (id) => setSelectedProcId(id),
      setEditorValue,
      render,
    },
  };
}
