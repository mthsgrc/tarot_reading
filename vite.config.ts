import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Relative base keeps the hash-routed SPA working from a GitHub Pages subpath.
  base: "./",
  plugins: [react()],
});
