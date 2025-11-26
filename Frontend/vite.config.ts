import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/v1/ext': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8001',
        ws: true,
        changeOrigin: true,
        rewriteWsOrigin: true,
      },
    },
  },
})