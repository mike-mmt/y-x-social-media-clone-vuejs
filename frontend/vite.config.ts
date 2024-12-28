import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../backend/public',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/scss/global.scss" as *;`
      }
    }
  }
})