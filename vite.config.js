import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // Bardzo ważne dla reblinski.github.io
  build: {
    outDir: 'dist',
  }
})