import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import ultraciteVitest from "ultracite/oxlint/vitest";

const localConfig = {};

export default defineConfig({
  extends: [core, ultraciteVitest],
  ignorePatterns: core.ignorePatterns,
  ...localConfig,
});
