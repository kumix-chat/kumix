import { describe, expect, it, vi } from "vitest";
import { createSrcDocUiPingPongBridge, isOriginAllowed } from "./bridge";

describe("ui-host bridge", () => {
  it("checks origin allowlist", () => {
    const policy = { name: "dev", capabilities: ["*"], pluginOrigins: ["null"] };
    expect(isOriginAllowed(policy, "null")).toBe(true);
    expect(isOriginAllowed(policy, "https://example.com")).toBe(false);
  });

  it("responds to ping with pong for matching token", () => {
    const iframeWindow = { postMessage: vi.fn() } as unknown as Window;

    const bridge = createSrcDocUiPingPongBridge({
      token: "token-1",
      policy: { name: "dev", capabilities: ["*"], pluginOrigins: ["*"] },
      getContentWindow: () => iframeWindow,
    });

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "null",
        source: iframeWindow,
        data: { type: "kumix.ping", id: "1", token: "token-1" },
      }),
    );

    expect(iframeWindow.postMessage).toHaveBeenCalledWith(
      { type: "kumix.pong", id: "1", token: "token-1" },
      "*",
    );

    bridge.dispose();
  });
});
