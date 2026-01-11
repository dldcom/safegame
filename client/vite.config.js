import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // root defaults to current working directory
  // publicDir defaults to 'public'
  server: {
    port: 3000,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      }
    }
  },
  build: {
    outDir: '../dist', // Build to root dist folder or keep it local? Let's keep it local 'dist' for now as per previous, or user might prefer root dist. Standard is local dist. Let's stick to 'dist'.
    emptyOutDir: true
  }
});
