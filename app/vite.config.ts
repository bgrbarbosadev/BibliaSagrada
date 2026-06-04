import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-vlibras': path.resolve(__dirname, 'node_modules/react-vlibras/dist/index.js'),
    },
  },
})
