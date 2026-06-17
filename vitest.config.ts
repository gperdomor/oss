import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.{mjs,js,ts,mts}', 'packages/class-variance-builder/vite.config.mts'],
  },
});
