import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

const cliSpecFilters = process.argv.filter((argument) => argument.endsWith('.spec.ts'))

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: cliSpecFilters.length > 0
      ? cliSpecFilters
      : ['src/**/*.spec.ts']
  }
}))
