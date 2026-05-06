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
    hmr: {
      overlay: true, // Show errors in browser
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@radix-ui/react-slot'],
  },
})
