import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-') || id.includes('micromark') || id.includes('mdast-') || id.includes('hast-') || id.includes('unist-') || id.includes('highlight.js') || id.includes('lowlight')) {
            return 'markdown';
          }
          if (id.includes('framer-motion') || id.includes('motion-')) {
            return 'motion';
          }
          if (id.includes('react-icons')) {
            return 'icons';
          }
          if (id.includes('react-router') || id.includes('@remix-run')) {
            return 'router';
          }
          if (id.includes('react-helmet-async')) {
            return 'helmet';
          }
          if (id.includes('date-fns')) {
            return 'date-fns';
          }
        },
      },
    },
  },
  ssr: {
    noExternal: true,
  },
});
