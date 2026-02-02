import { describe, expect, it } from "vitest";
import { areCapabilitiesAllowed, getActivePolicyName, getBundledPolicy } from "./policy";

describe("policy", () => {
  it("defaults to dev in test mode", () => {
    expect(getActivePolicyName()).toBe("dev");
  });

  it("supports KUMIX_POLICY override", () => {
    const original = process.env.KUMIX_POLICY;
    process.env.KUMIX_POLICY = "strict";
    try {
      expect(getActivePolicyName()).toBe("strict");
    } finally {
      if (typeof original === "undefined") delete process.env.KUMIX_POLICY;
      else process.env.KUMIX_POLICY = original;
    }
  });

  it("loads bundled dev policy", () => {
    const policy = getBundledPolicy("dev");
    expect(policy.name).toBe("dev");
    expect(policy.capabilities).toContain("*");
  });

  it("checks capability allowlist", () => {
    const strict = getBundledPolicy("strict");
    expect(areCapabilitiesAllowed(strict, ["render.markdown"])).toBe(false);

    const dev = getBundledPolicy("dev");
    expect(areCapabilitiesAllowed(dev, ["render.markdown"])).toBe(true);
  });
});
