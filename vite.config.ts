import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.BASE ?? '/app/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  server: {
    host: true,
    port: 3000,
  }
});
