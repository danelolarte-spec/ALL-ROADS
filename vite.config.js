import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages project site:
// https://danelolarte-spec.github.io/ALL-ROADS/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/ALL-ROADS/' : '/',
  plugins: [react()],
  server: { host: true, port: 5173 },
})
