import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});