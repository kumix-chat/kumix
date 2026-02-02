import type { HostToPluginMessage } from "@kumix/plugin-sdk";
import { describe, expect, it, vi } from "vitest";
import { createProcExtensionSession } from "./session";

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

describe("createProcExtensionSession", () => {
  it("pings on startup and enforces declared capabilities", async () => {
    const worker = new FakeWorker();
    const session = createProcExtensionSession(() => worker as unknown as Worker, {
      timeoutMs: 1_000,
      policy: { name: "dev", capabilities: ["*"], pluginOrigins: ["*"] },
      capabilities: ["render.markdown"],
    });

    const ping = worker.posted.at(0) as HostToPluginMessage;
    expect(ping.type).toBe("ping");
    worker.emit({ type: "pong", id: ping.id });
    await session.ready;

    await expect(session.renderMermaid("graph TD")).rejects.toThrow("does not declare capability");
    expect(worker.posted.length).toBe(1);

    const renderPromise = session.renderMarkdown("# hi");
    const render = worker.posted.at(1) as HostToPluginMessage;
    expect(render.type).toBe("render");
    expect(render.format).toBe("markdown");
    worker.emit({ type: "render.result", id: render.id, html: "<h1>hi</h1>" });
    await expect(renderPromise).resolves.toBe("<h1>hi</h1>");

    session.dispose();
    expect(worker.terminated).toBe(true);
  });

  it("rejects session creation when policy blocks capabilities", () => {
    expect(() =>
      createProcExtensionSession(() => new FakeWorker() as unknown as Worker, {
        policy: { name: "strict", capabilities: [], pluginOrigins: [] },
        capabilities: ["render.markdown"],
      }),
    ).toThrow("does not allow");
  });

  it("times out", async () => {
    vi.useFakeTimers();
    const worker = new FakeWorker();
    const session = createProcExtensionSession(() => worker as unknown as Worker, {
      timeoutMs: 10,
      policy: { name: "dev", capabilities: ["*"], pluginOrigins: ["*"] },
      capabilities: ["render.markdown"],
    });

    await vi.advanceTimersByTimeAsync(20);
    await expect(session.ready).rejects.toThrow("timed out");

    session.dispose();
    vi.useRealTimers();
  });
});
