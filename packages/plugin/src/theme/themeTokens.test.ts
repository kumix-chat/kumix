import { describe, expect, it } from "vitest";
import { validateThemeTokens } from "./themeTokens";

describe("@kumix/plugin theme tokens", () => {
  it("accepts a minimal token set", () => {
    expect(
      validateThemeTokens({
        light: { bg: "white" },
        dark: { bg: "black" },
      }),
    ).toEqual({
      light: { bg: "white" },
      dark: { bg: "black" },
    });
  });

  it("rejects unknown keys", () => {
    expect(() =>
      validateThemeTokens({
        light: { "not-allowed": "x" },
        dark: {},
      }),
    ).toThrow(/not-allowed/u);
  });
});
