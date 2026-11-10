import { defineConfig } from 'vite'

export default defineConfig({
  // deck.gl-geotiff decodes tiles in an ES-module worker (top-level await)
  worker: { format: 'es' },
})
