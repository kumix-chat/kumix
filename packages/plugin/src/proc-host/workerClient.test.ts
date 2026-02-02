import type { HostToPluginMessage } from "@kumix/plugin-sdk";
import { describe, expect, it, vi } from "vitest";
import { createProcWorkerClient } from "./workerClient";

type MessageHandler = (event: MessageEvent) => void;

class FakeWorker {
  posted: unknown[] = [];
  terminated = false;
  #handlers = new Set<MessageHandler>();

  addEventListener(type: string, handler: MessageHandler) {
    if (type !== "message") return;
    this.#handlers.add(handler);
  }

  removeEventListener(type: string, handler: MessageHandler) {
    if (type !== "message") return;
    this.#handlers.delete(handler);
  }

  postMessage(message: unknown) {
    this.posted.push(message);
  }

  terminate() {
    this.terminated = true;
  }

  emit(message: unknown) {
    const event = { data: message } as MessageEvent;
    for (const handler of this.#handlers) handler(event);
  }
}

describe("createProcWorkerClient", () => {
  it("pings and receives pong", async () => {
    const worker = new FakeWorker();
    const client = createProcWorkerClient(worker as unknown as Worker, { timeoutMs: 1_000 });

    const pingPromise = client.ping();
    const message = worker.posted.at(0) as HostToPluginMessage;
    expect(message.type).toBe("ping");

    worker.emit({ type: "pong", id: message.id });
    await pingPromise;

    client.dispose();
    expect(worker.terminated).toBe(true);
  });

  it("renders markdown", async () => {
    const worker = new FakeWorker();
    const client = createProcWorkerClient(worker as unknown as Worker, { timeoutMs: 1_000 });

    const renderPromise = client.renderMarkdown("# hi");
    const message = worker.posted.at(0) as HostToPluginMessage;
    expect(message.type).toBe("render");
    expect(message.format).toBe("markdown");
    expect(message.source).toBe("# hi");

    worker.emit({ type: "render.result", id: message.id, html: "<h1>hi</h1>" });
    await expect(renderPromise).resolves.toBe("<h1>hi</h1>");

    client.dispose();
  });

  it("renders mermaid", async () => {
    const worker = new FakeWorker();
    const client = createProcWorkerClient(worker as unknown as Worker, { timeoutMs: 1_000 });

    const renderPromise = client.renderMermaid("graph TD");
    const message = worker.posted.at(0) as HostToPluginMessage;
    expect(message.type).toBe("render");
    expect(message.format).toBe("mermaid");
    expect(message.source).toBe("graph TD");

    worker.emit({ type: "render.result", id: message.id, html: "<pre>graph TD</pre>" });
    await expect(renderPromise).resolves.toBe("<pre>graph TD</pre>");

    client.dispose();
  });

  it("times out", async () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const client = createProcWorkerClient(worker as unknown as Worker, { timeoutMs: 10 });

    const promise = client.ping();
    const assertion = expect(promise).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(20);
    await assertion;

    client.dispose();
    vi.useRealTimers();
  });
});
