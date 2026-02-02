import path from "node:path";
import { fileURLToPath } from "node:url";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
process.env.LINGUI_CONFIG ??= path.join(workspaceRoot, "lingui.config.ts");

export default defineProject({
  plugins: [
    react({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    tsconfigPaths(),
    lingui(),
  ],
  test: {
    name: "web",
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
