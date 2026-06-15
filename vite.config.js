import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'

/**
 * Vite plugin that generates firebase-messaging-sw.js from a template,
 * replacing __VITE_*__ placeholders with actual env values.
 * This is needed because service workers can't access import.meta.env.
 */
function firebaseSwPlugin() {
  return {
    name: 'firebase-sw',
    configResolved(config) {
      const template = fs.readFileSync(
        path.resolve(__dirname, 'src/firebase-messaging-sw.template.js'),
        'utf-8'
      );

      const output = template
        .replace(/__VITE_FIREBASE_API_KEY__/g, config.env.VITE_FIREBASE_API_KEY || '')
        .replace(/__VITE_FIREBASE_AUTH_DOMAIN__/g, config.env.VITE_FIREBASE_AUTH_DOMAIN || '')
        .replace(/__VITE_FIREBASE_PROJECT_ID__/g, config.env.VITE_FIREBASE_PROJECT_ID || '')
        .replace(/__VITE_FIREBASE_MESSAGING_SENDER_ID__/g, config.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')
        .replace(/__VITE_FIREBASE_APP_ID__/g, config.env.VITE_FIREBASE_APP_ID || '');

      fs.writeFileSync(
        path.resolve(__dirname, 'public/firebase-messaging-sw.js'),
        output
      );
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), firebaseSwPlugin()],
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
