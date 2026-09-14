import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode === 'production') {
    const apiUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL?.trim()

    try {
      const url = new URL(apiUrl ?? '')
      if (url.protocol !== 'https:' || url.origin !== apiUrl) {
        throw new Error('Invalid API origin')
      }
    } catch {
      throw new Error('Set VITE_API_URL to the exact HTTPS origin of the deployed backend before building for production.')
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
