import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3002,
    },
    base: './',
    optimizeDeps: {
        include: ['node_modules/@chili-publish/grafx-shared-components'],
    },

    resolve: {
        // force Vite to always resolve listed dependencies to the same copy (from project root).
        dedupe: ['react', 'react-dom'],
    },
    build: {
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: 'bundle.js',
                chunkFileNames: 'bundle.js',
                assetFileNames: 'main.[ext]',
            },
        },
    },
});
