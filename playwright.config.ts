import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 60000,
  testDir: "./src", // <-- ensure the test directory is set correctly
  // other configurations
});

