import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: 'src/client',
  build: {
    outDir: '../../dist/client'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})