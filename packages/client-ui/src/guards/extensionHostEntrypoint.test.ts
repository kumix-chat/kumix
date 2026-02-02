import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
      continue;
    }
    if (!entry.isFile()) continue;
    if (full.endsWith(".ts") || full.endsWith(".tsx")) files.push(full);
  }

  return files;
}

describe("client-ui extension host entrypoints", () => {
  it("does not bypass @kumix/plugin host APIs", () => {
    const clientUiRoot = path.resolve(__dirname, "..");
    const files = walk(clientUiRoot);

    const forbidden = [
      "createProcExtensionSession(",
      "createProcWorkerClient(",
      "createSrcDocUiPingPongBridge(",
      "injectKumixUiBootstrap(",
      "createUiToken(",
      "new Worker(",
      "@kumix/plugin/src/",
    ];

    const violations: string[] = [];
    for (const file of files) {
      if (file.endsWith(path.join("guards", "extensionHostEntrypoint.test.ts"))) continue;
      const text = readFileSync(file, "utf8");
      for (const token of forbidden) {
        if (text.includes(token)) violations.push(`${file}: forbidden token "${token}"`);
      }
    }

    expect(violations).toEqual([]);
  });
});
