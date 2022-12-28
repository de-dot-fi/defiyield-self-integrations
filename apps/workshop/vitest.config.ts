import { Project } from '@defiyield/sandbox';
import { defineConfig } from 'vitest/config';

declare module 'vitest' {
  export interface TestContext {
    project: Project;
  }
}

export default defineConfig({
  test: {
    include: ['projects/**/*.spec.ts'],
    testTimeout: 10_000, // 10 seconds
  },
});
