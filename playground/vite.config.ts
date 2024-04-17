import { defineConfig } from 'vite'
import EnvRuntime from '../src'

export default defineConfig({
  server: { port: 3001 },
  plugins: [
    EnvRuntime(),
  ],
})
