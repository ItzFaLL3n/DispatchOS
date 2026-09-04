import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Default environment is node — the primary test seam is the pure `derive`
 * module (see os/specs/0001-phase-1-crm-port.md). A component or DB-harness
 * test that needs the DOM opts in per file with:  // @vitest-environment jsdom
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});
