import { describe, expect, it } from "vitest";
import { injectKumixUiBootstrap } from "./srcdoc";

describe("injectKumixUiBootstrap", () => {
  it("injects bootstrap into <head>", () => {
    const html = "<!doctype html><html><head></head><body>ok</body></html>";
    const result = injectKumixUiBootstrap(html, {
      extensionId: "x",
      token: "t",
      hostOrigin: "http://localhost",
    });
    expect(result).toContain("window.__KUMIX_UI_BOOTSTRAP__");
    expect(result).toContain('"extensionId":"x"');
    expect(result).toContain('"token":"t"');
    expect(result).toContain('"hostOrigin":"http://localhost"');
  });
});
