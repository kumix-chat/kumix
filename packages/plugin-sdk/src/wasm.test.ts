import { describe, expect, it } from "vitest";
import { instantiateWasm } from "./wasm";

const ADD_WASM = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01,
  0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00, 0x0a, 0x09,
  0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,
]);

describe("instantiateWasm", () => {
  it("instantiates from Uint8Array and calls exports", async () => {
    const { instance } = await instantiateWasm(ADD_WASM);
    const exportsRecord = instance.exports as Record<string, unknown>;
    const add = exportsRecord.add as ((a: number, b: number) => number) | undefined;
    if (!add) throw new Error("WASM export `add` not found");
    expect(add(1, 2)).toBe(3);
    expect(add(40, 2)).toBe(42);
  });
});
