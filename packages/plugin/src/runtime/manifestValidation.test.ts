import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { PluginCapability } from "@kumix/plugin-sdk";
import Ajv2020 from "ajv/dist/2020";
import { describe, expect, it } from "vitest";
import { areCapabilitiesAllowed, getBundledPolicy } from "../policy/policy";

type Manifest = {
  id: string;
  name: string;
  version: string;
  kind: "ui" | "proc";
  capabilities: string[];
  timeoutMs?: number;
  ui?: { entry: "entry.html"; distribution: "srcdoc" };
  proc?: { entry: "worker.ts"; wasm?: { mode: "embedded" | "file"; file?: string } };
};

function walkFiles(dir: string, filter: (fullPath: string) => boolean): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(full, filter));
      continue;
    }
    if (entry.isFile() && filter(full)) files.push(full);
  }

  return files;
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8")) as unknown;
}

describe("extensions manifest validation", () => {
  it("validates manifests against schema and directory id", () => {
    const repoRoot = path.resolve(__dirname, "../../../..");
    const rootPkg = readJson(path.join(repoRoot, "package.json")) as { version?: string };
    expect(typeof rootPkg.version).toBe("string");
    const rootVersion = String(rootPkg.version);

    const schemaPath = path.join(repoRoot, "extensions", "manifest.schema.json");
    expect(statSync(schemaPath).isFile()).toBe(true);

    const schema = readJson(schemaPath);
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const validate = ajv.compile(schema);

    const extensionsDir = path.join(repoRoot, "extensions");
    const manifestFiles = walkFiles(extensionsDir, (fullPath) =>
      fullPath.endsWith("manifest.json"),
    );
    expect(manifestFiles.length).toBeGreaterThan(0);

    const seenIds = new Set<string>();
    const manifests: Manifest[] = [];

    for (const manifestPath of manifestFiles) {
      const raw = readJson(manifestPath);
      const ok = validate(raw);
      if (!ok) {
        const message = ajv.errorsText(validate.errors, { separator: "\n" });
        throw new Error(`Invalid manifest: ${manifestPath}\n${message}`);
      }

      const manifest = raw as Manifest;
      const dirId = path.basename(path.dirname(manifestPath));
      expect(manifest.id).toBe(dirId);
      expect(manifest.version).toBe(rootVersion);

      expect(seenIds.has(manifest.id)).toBe(false);
      seenIds.add(manifest.id);

      const rel = manifestPath.replaceAll("\\", "/");
      const expectedKind = rel.includes("/extensions/ui/")
        ? "ui"
        : rel.includes("/extensions/proc/")
          ? "proc"
          : null;
      expect(expectedKind).not.toBeNull();
      expect(manifest.kind).toBe(expectedKind);

      const extDir = path.dirname(manifestPath);
      if (manifest.kind === "ui") {
        const entryPath = path.join(extDir, manifest.ui?.entry ?? "entry.html");
        expect(statSync(entryPath).isFile()).toBe(true);
      }

      if (manifest.kind === "proc") {
        const entryPath = path.join(extDir, manifest.proc?.entry ?? "worker.ts");
        expect(statSync(entryPath).isFile()).toBe(true);

        const wasm = manifest.proc?.wasm;
        if (wasm?.mode === "file") {
          expect(typeof wasm.file).toBe("string");
          const wasmPath = path.join(extDir, String(wasm.file));
          expect(statSync(wasmPath).isFile()).toBe(true);
        }

        if (wasm?.mode === "embedded") {
          const wasmDir = path.join(extDir, "wasm");
          expect(statSync(wasmDir).isDirectory()).toBe(true);
        }
      }

      manifests.push(manifest);
    }

    const strict = getBundledPolicy("strict");
    const allowedUi = manifests.filter(
      (m) =>
        m.kind === "ui" &&
        areCapabilitiesAllowed(strict, m.capabilities as unknown as PluginCapability[]),
    );
    const allowedProc = manifests.filter(
      (m) =>
        m.kind === "proc" &&
        areCapabilitiesAllowed(strict, m.capabilities as unknown as PluginCapability[]),
    );
    expect(allowedUi.length).toBeGreaterThan(0);
    expect(allowedProc.length).toBeGreaterThan(0);
  });
});
