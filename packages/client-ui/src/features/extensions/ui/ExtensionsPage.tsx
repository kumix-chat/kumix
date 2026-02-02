import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Select,
  Textarea,
} from "@kumix/ui";
import { Trans } from "@lingui/react/macro";
import { useEffect, useRef } from "react";
import { useExtensionsVm } from "../vm/useExtensionsVm";

export function ExtensionsPage() {
  const vm = useExtensionsVm();
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vm.state.procFormat !== "mermaid") return;
    if (!vm.state.renderedHtml) return;

    const root = outputRef.current;
    if (!root) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(".mermaid:not([data-kumix-rendered])"),
    );
    if (nodes.length === 0) return;

    let cancelled = false;
    void (async () => {
      const { default: mermaid } = await import("mermaid");
      if (cancelled) return;

      const isDark = document.documentElement.classList.contains("dark");
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: isDark ? "dark" : "default",
      });

      let counter = 0;
      for (const node of nodes) {
        const source = node.textContent ?? "";
        if (!source.trim()) continue;

        const id = `kumix-mermaid-${Date.now()}-${counter++}`;
        try {
          const result = await mermaid.render(id, source);
          node.innerHTML = result.svg;
          if (typeof result.bindFunctions === "function") result.bindFunctions(node);
          node.setAttribute("data-kumix-rendered", "true");
        } catch {
          // If mermaid fails, keep the raw source visible.
        }
      }
    })().catch(() => {
      // If mermaid fails, keep the raw source visible.
    });

    return () => {
      cancelled = true;
    };
  }, [vm.state.procFormat, vm.state.renderedHtml]);

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans id="extensions.title">Extensions</Trans>
          </CardTitle>
          <CardDescription>
            <Trans id="extensions.description">
              Bundled extensions come in two kinds: UI (iframe) and Proc (worker).
            </Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-[color:var(--muted-fg)]">
          <ul className="list-disc pl-5">
            <li>
              <Trans id="extensions.kinds.uiLabel">UI:</Trans> <code>extensions/ui</code>{" "}
              <Trans id="extensions.kinds.uiSuffix">(sandboxed iframe apps)</Trans>
            </li>
            <li>
              <Trans id="extensions.kinds.procLabel">Proc:</Trans> <code>extensions/proc</code>{" "}
              <Trans id="extensions.kinds.procSuffix">(Web Worker processors)</Trans>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans id="extensions.controls.title">Extension Controls</Trans>
          </CardTitle>
          <CardDescription>
            <Trans id="extensions.controls.description">
              Enable/disable bundled extensions (stored via a key-value port; default:
              localStorage).
            </Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            <div className="text-xs font-semibold text-[color:var(--fg)]">
              <Trans id="extensions.controls.ui">UI</Trans>
            </div>
            {vm.state.ui.length === 0 ? (
              <div className="text-sm text-[color:var(--muted-fg)]">
                <Trans id="extensions.ui.noneFound">No UI extensions found.</Trans>
              </div>
            ) : (
              <div className="grid gap-2">
                {vm.state.ui.map((ext) => {
                  const key = `ui:${ext.manifest.id}` as const;
                  const label = `${ext.manifest.name} (${ext.manifest.id})`;
                  return (
                    <div
                      key={ext.manifest.id}
                      className="flex items-start gap-2 text-sm text-[color:var(--muted-fg)]"
                    >
                      <Checkbox
                        checked={vm.state.enabledKeys.includes(key)}
                        onChange={(event) => vm.actions.setEnabled(key, event.target.checked)}
                        aria-label={label}
                      />
                      <span className="grid">
                        <span className="text-[color:var(--fg)]">{ext.manifest.name}</span>
                        <span className="text-xs text-[color:var(--muted-fg)] opacity-80">
                          {ext.manifest.id} / {ext.manifest.capabilities.join(", ")}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-semibold text-[color:var(--fg)]">
              <Trans id="extensions.controls.proc">Proc</Trans>
            </div>
            {vm.state.proc.length === 0 ? (
              <div className="text-sm text-[color:var(--muted-fg)]">
                <Trans id="extensions.proc.noneFound">No proc extensions found.</Trans>
              </div>
            ) : (
              <div className="grid gap-2">
                {vm.state.proc.map((ext) => {
                  const key = `proc:${ext.manifest.id}` as const;
                  const label = `${ext.manifest.name} (${ext.manifest.id})`;
                  return (
                    <div
                      key={ext.manifest.id}
                      className="flex items-start gap-2 text-sm text-[color:var(--muted-fg)]"
                    >
                      <Checkbox
                        checked={vm.state.enabledKeys.includes(key)}
                        onChange={(event) => vm.actions.setEnabled(key, event.target.checked)}
                        aria-label={label}
                      />
                      <span className="grid">
                        <span className="text-[color:var(--fg)]">{ext.manifest.name}</span>
                        <span className="text-xs text-[color:var(--muted-fg)] opacity-80">
                          {ext.manifest.id} / {ext.manifest.capabilities.join(", ")}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans id="extensions.ui.title">UI Extension</Trans>
            </CardTitle>
            <CardDescription>
              <Trans id="extensions.ui.description">
                Loaded as an iframe with postMessage bridge.
              </Trans>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {vm.state.selectedUi ? (
              <>
                <Select
                  value={vm.state.selectedUiId}
                  onChange={(event) => vm.actions.selectUi(event.target.value)}
                >
                  {vm.state.enabledUi.map((ext) => (
                    <option key={ext.manifest.id} value={ext.manifest.id}>
                      {ext.manifest.name}
                    </option>
                  ))}
                </Select>
                <div className="text-xs text-[color:var(--muted-fg)] opacity-80">
                  {vm.state.selectedUi.manifest.id} / v{vm.state.selectedUi.manifest.version} /{" "}
                  {vm.state.selectedUi.manifest.capabilities.join(", ")}
                </div>
                {vm.state.uiState.kind === "error" ? (
                  <Alert variant="destructive">
                    <AlertDescription>{vm.state.uiState.message}</AlertDescription>
                  </Alert>
                ) : null}
                <iframe
                  ref={vm.refs.iframeRef}
                  title={vm.state.selectedUi.manifest.name}
                  sandbox={vm.state.selectedUiIframe?.sandbox}
                  referrerPolicy={vm.state.selectedUiIframe?.referrerPolicy}
                  srcDoc={vm.state.selectedUiSrcDoc}
                  className="h-[320px] w-full rounded-xl border border-[color:var(--border)] bg-[var(--overlay)]"
                />
              </>
            ) : (
              <div className="text-sm text-[color:var(--muted-fg)]">
                <Trans id="extensions.ui.noneEnabled">No UI extensions enabled.</Trans>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans id="extensions.proc.title">Proc Extension</Trans>
            </CardTitle>
            <CardDescription>
              <Trans id="extensions.proc.description">Runs in a Web Worker and returns HTML.</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {vm.state.selectedProc ? (
              <>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="grid gap-2">
                    <Select
                      value={vm.state.selectedProcId}
                      onChange={(event) => vm.actions.selectProc(event.target.value)}
                    >
                      {vm.state.enabledProc.map((ext) => (
                        <option key={ext.manifest.id} value={ext.manifest.id}>
                          {ext.manifest.name}
                        </option>
                      ))}
                    </Select>
                    <div className="text-xs text-[color:var(--muted-fg)] opacity-80">
                      {vm.state.selectedProc.manifest.id} / v
                      {vm.state.selectedProc.manifest.version} /{" "}
                      {vm.state.selectedProc.manifest.capabilities.join(", ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      intent="outline"
                      onPress={() => void vm.actions.render()}
                      isDisabled={vm.state.procState.kind === "rendering"}
                    >
                      <Trans id="extensions.proc.button.render">Render</Trans>
                    </Button>
                  </div>
                </div>

                <Textarea
                  value={vm.state.editorValue}
                  onChange={(event) => vm.actions.setEditorValue(event.target.value)}
                  className="min-h-[160px] font-mono text-xs"
                />
              </>
            ) : (
              <div className="text-sm text-[color:var(--muted-fg)]">
                <Trans id="extensions.proc.noneEnabled">No proc extensions enabled.</Trans>
              </div>
            )}

            {vm.state.procState.kind === "error" ? (
              <Alert variant="destructive">
                <AlertDescription>{vm.state.procState.message}</AlertDescription>
              </Alert>
            ) : null}

            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--overlay)] p-3">
              <div className="text-xs font-semibold text-[color:var(--fg)]">
                <Trans id="extensions.proc.output">Output</Trans>
              </div>
              <div
                ref={outputRef}
                className="mt-2 grid gap-2 text-sm text-[color:var(--muted-fg)]"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Proc extensions return HTML (demo); production should sanitize/escape per capability.
                dangerouslySetInnerHTML={{ __html: vm.state.renderedHtml }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
