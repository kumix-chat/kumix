import { describe, expect, it } from "vitest"
import { getBundledExtensions } from "./registry"

describe("@kumix/plugin", () => {
  it("lists bundled UI + proc extensions", () => {
    const bundled = getBundledExtensions()
    expect(bundled.ui.length).toBeGreaterThan(0)
    expect(bundled.proc.length).toBeGreaterThan(0)
  })
})

