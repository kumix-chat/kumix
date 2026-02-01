import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: () => false,
  invoke: vi.fn()
}))

describe("apps/desktop", () => {
  it("renders in web mode when not running in Tauri", async () => {
    const { DesktopBridge } = await import("./DesktopBridge")
    render(<DesktopBridge />)

    expect(await screen.findByText("Running in web mode")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Invoke backend" })).toBeDisabled()
  })
})
