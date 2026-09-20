import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Prevent Vite from picking up backend tsconfig changes
      ignored: ['**/backend/**'],
    },
  },
})
