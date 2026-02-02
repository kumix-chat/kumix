import { describe, expect, it } from "vitest";
import { getBundledExtensions } from "./registry";

describe("@kumix/plugin", () => {
  it("lists bundled UI + proc extensions", () => {
    const bundled = getBundledExtensions();
    expect(bundled.ui.length).toBeGreaterThan(0);
    expect(bundled.proc.length).toBeGreaterThan(0);
  });

  it("filters extensions by active policy", () => {
    const original = process.env.KUMIX_POLICY;
    process.env.KUMIX_POLICY = "strict";
    try {
      const bundled = getBundledExtensions();
      expect(bundled.ui).toHaveLength(0);
      expect(bundled.proc).toHaveLength(0);
    } finally {
      if (typeof original === "undefined") delete process.env.KUMIX_POLICY;
      else process.env.KUMIX_POLICY = original;
    }
  });
});
