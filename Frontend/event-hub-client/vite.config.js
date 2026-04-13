import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      autoCodeSplitting: true,
    }),
    react(),   // Must be AFTER tanstackRouter
  ],

  server: {
    port: 3002,
    open: false,
  },

  resolve: {
    alias: {
      '@': '/src',
    }
  }
})