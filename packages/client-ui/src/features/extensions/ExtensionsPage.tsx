import { Trans } from "@lingui/react/macro"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Textarea } from "@kumix/ui"
import { createProcWorkerClient, getBundledExtensions } from "@kumix/plugin"
import { useEffect, useMemo, useRef, useState } from "react"

type ProcState =
  | { kind: "idle" }
  | { kind: "ready" }
  | { kind: "rendering" }
  | { kind: "error"; message: string }

export function ExtensionsPage() {
  const { ui, proc } = useMemo(() => getBundledExtensions(), [])
  const githubPanel = ui[0]
  const markdownRenderer = proc[0]

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

  const [procState, setProcState] = useState<ProcState>({ kind: "idle" })
  const [markdownSource, setMarkdownSource] = useState<string>(
    "# kumix\n\nThis is a proc extension demo.\n\n## Notes\n\n- Runs in a Web Worker\n- Uses postMessage request/response\n"
  )
  const [renderedHtml, setRenderedHtml] = useState<string>("")

  useEffect(() => {
    const worker = markdownRenderer.createWorker()
    const client = createProcWorkerClient(worker)

    client
      .ping()
      .then(() => setProcState({ kind: "ready" }))
      .catch((error) => setProcState({ kind: "error", message: error instanceof Error ? error.message : String(error) }))

    return () => client.dispose()
  }, [markdownRenderer])

  async function render() {
    try {
      setProcState({ kind: "rendering" })
      const worker = markdownRenderer.createWorker()
      const client = createProcWorkerClient(worker)
      const html = await client.renderMarkdown(markdownSource)
      client.dispose()
      setRenderedHtml(html)
      setProcState({ kind: "ready" })
    } catch (error) {
      setProcState({ kind: "error", message: error instanceof Error ? error.message : String(error) })
    }
  }

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
        <CardContent className="text-sm text-slate-200">
          <ul className="list-disc pl-5">
            <li>
              UI: <code>extensions/ui</code> (sandboxed iframe apps)
            </li>
            <li>
              Proc: <code>extensions/proc</code> (Web Worker processors)
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans id="extensions.ui.title">UI Extension</Trans>
            </CardTitle>
            <CardDescription>
              <Trans id="extensions.ui.description">Loaded as an iframe with postMessage bridge.</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="text-xs text-slate-400">
              {githubPanel.manifest.name} v{githubPanel.manifest.version} (
              {githubPanel.manifest.capabilities.join(", ")})
            </div>
            <iframe
              ref={iframeRef}
              title={githubPanel.manifest.name}
              sandbox="allow-scripts"
              srcDoc={githubPanel.html}
              className="h-[320px] w-full rounded-xl border border-white/10 bg-slate-950"
            />
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-400">
                {markdownRenderer.manifest.name} v{markdownRenderer.manifest.version} (
                {markdownRenderer.manifest.capabilities.join(", ")})
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => void render()} disabled={procState.kind === "rendering"}>
                  <Trans id="extensions.proc.button.render">Render</Trans>
                </Button>
              </div>
            </div>

            <Textarea
              value={markdownSource}
              onChange={(event) => setMarkdownSource(event.target.value)}
              className="min-h-[160px] font-mono text-xs"
            />

            {procState.kind === "error" ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                {procState.message}
              </div>
            ) : null}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-xs font-semibold text-slate-200">
                <Trans id="extensions.proc.output">Output</Trans>
              </div>
              <div
                className="mt-2 grid gap-2 text-sm text-slate-100"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

