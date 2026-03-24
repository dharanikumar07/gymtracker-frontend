import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on 0.0.0.0 for Docker port forwarding
    port: 6500,
    watch: {
      usePolling: true, // Needed for file changes with Docker volume mounts
    },
  },
})
