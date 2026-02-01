import { defineConfig } from "@lingui/cli"

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "ja"],
  catalogs: [
    {
      path: "<rootDir>/packages/client-ui/src/locales/{locale}/messages",
      include: ["apps/web/src", "packages/client-ui/src"],
      exclude: ["**/*.test.*", "**/node_modules/**"]
    }
  ]
})

