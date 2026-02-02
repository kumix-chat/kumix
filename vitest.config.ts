import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "apps/web/vitest.config.ts",
      "apps/desktop/vitest.config.ts",
      "packages/vitest.config.ts",
    ],
  },
});
