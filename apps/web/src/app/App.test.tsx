import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import { App } from "./App";

describe("apps/web", () => {
  it("switches locale using Lingui", async () => {
    localStorage.clear();

    render(<App />);

    await screen.findByRole("link", { name: "Home" });

    const language = screen.getByRole("combobox", { name: "Language" });
    fireEvent.change(language, { target: { value: "ja" } });

    await screen.findByRole("link", { name: "ホーム" });
  });
});
