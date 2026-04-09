import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const fromWebRoot = (path: string) => new URL(path, import.meta.url).pathname
const repoRoot = fromWebRoot('../..')

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  resolve: {
    alias: {
      vue: fromWebRoot('./node_modules/vue'),
      pinia: fromWebRoot('./node_modules/pinia'),
      nanoid: fromWebRoot('./node_modules/nanoid'),
      'd3-geo': fromWebRoot('./node_modules/d3-geo'),
      '@floating-ui/dom': fromWebRoot('./node_modules/@floating-ui/dom'),
      '@vue/test-utils': fromWebRoot('./node_modules/@vue/test-utils')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    },
    fs: {
      allow: [repoRoot]
    }
  }
})
