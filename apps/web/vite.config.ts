import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { lingui } from "@lingui/vite-plugin"

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
process.env.LINGUI_CONFIG ??= path.join(workspaceRoot, "lingui.config.ts")

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"]
      }
    }),
    tsconfigPaths(),
    lingui()
  ],
  server: {
    port: 5173,
    fs: {
      allow: [workspaceRoot]
    }
  }
})
