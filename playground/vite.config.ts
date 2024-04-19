import { defineConfig } from 'vite'
import EnvRuntime from '../src'

export default defineConfig({
  server: { port: 3001 },
  plugins: [
    EnvRuntime({
      include: ['VITE_APP_*'],
      // include: ['VITE_APP_TITLE'],
      exclude: ['VITE_APP_COLOR'],
      // exclude: ['VITE_EXCLUDE_*'],
      // exclude: ['VITE_EXCLUDE_VALUE'],
    }),
  ],
})
