import { defineConfig } from 'vite'
import EnvRuntime from '../src'

export default defineConfig({
  server: { port: 3001 },
  plugins: [
    EnvRuntime({
      include: 'VITE_APP_*',
      exclude: 'VITE_EXCLUDE_*',
    }),
  ],
})
