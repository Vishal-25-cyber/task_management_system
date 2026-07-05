import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Split vendors into separate cacheable chunks
    // Vite 8 (rolldown) requires manualChunks as a function
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
            if (id.includes('/react/'))   return 'react-vendor';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('chart.js') || id.includes('react-chartjs')) return 'charts';
            if (id.includes('hello-pangea')) return 'dnd';
            if (id.includes('react-icons')) return 'icons';
            if (id.includes('axios') || id.includes('date-fns') ||
                id.includes('react-hot-toast') || id.includes('react-hook-form')) return 'utils';
          }
        },
      },
    },
  },

  // Pre-bundle heavy deps for faster dev server cold start
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'framer-motion', 'axios', 'date-fns',
      'react-hook-form', 'react-hot-toast',
    ],
  },
})
