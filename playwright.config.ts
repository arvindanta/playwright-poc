import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 60000,
  testDir: "./src", // <-- ensure the test directory is set correctly
  // other configurations
  reporter: [
    ["list"], // You can have multiple reporters
    ["html"],
    ["allure-playwright"],
  ],
  use: {
    trace: "on", // To attach trace artifacts (optional)
  },
});
