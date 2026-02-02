import { describe, expect, it, vi } from "vitest";
import { DesktopSqliteKeyValue } from "./desktopSqliteKeyValue";

describe("DesktopSqliteKeyValue", () => {
  it("uses invoke when tauri", async () => {
    const invoke = vi.fn(async (command: string) => {
      if (command === "kv_get") return "value";
      return null;
    });

    const kv = new DesktopSqliteKeyValue({ invoke, isTauri: () => true });
    await expect(kv.get("k")).resolves.toBe("value");

    await kv.set("k", "v");
    expect(invoke).toHaveBeenCalledWith("kv_set", { key: "k", value: "v" });
  });

  it("falls back when not tauri", async () => {
    const invoke = vi.fn(async () => "nope");
    const kv = new DesktopSqliteKeyValue({ invoke, isTauri: () => false });

    await kv.set("k", "v");
    expect(invoke).not.toHaveBeenCalled();
  });
});
