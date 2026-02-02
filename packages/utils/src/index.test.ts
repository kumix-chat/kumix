import { describe, expect, it } from "vitest";
import { isDefined } from "./index";

describe("@kumix/utils", () => {
  it("isDefined narrows null/undefined", () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });
});
