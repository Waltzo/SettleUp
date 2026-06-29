import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match GitHub repo name for Pages subpath hosting
export default defineConfig({
  plugins: [react()],
  base: '/SettleUp/',
})
