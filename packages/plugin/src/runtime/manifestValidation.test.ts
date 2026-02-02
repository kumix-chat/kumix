import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { describe, expect, it } from "vitest";

type Manifest = {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  timeoutMs?: number;
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
    }
  });
});
