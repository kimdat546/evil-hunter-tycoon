import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.', 
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'manner-welfare-adjust-start.trycloudflare.com',
      '.trycloudflare.com'
    ]
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './src/shared'),
      '@client': resolve(__dirname, './src/client'),
    },
  },
  define: {
    'import.meta.env.VITE_SERVER_URL': JSON.stringify(process.env.VITE_SERVER_URL || 'http://localhost:3001'),
  },
  optimizeDeps: {
    include: ['pixi.js', 'socket.io-client'],
  },
  assetsInclude: ['**/*.json'],
});