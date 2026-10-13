import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      // Requests to /api/quote will be proxied to the Vercel serverless function
      '/api/quote': {
        target: 'http://localhost:3000', // Your local Vite dev server
        changeOrigin: true,
      },
    },
  },
})

