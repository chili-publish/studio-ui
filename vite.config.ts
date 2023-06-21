import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import EnvironmentPlugin from 'vite-plugin-environment';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), EnvironmentPlugin(['NODE_ENV', 'DEFAULT_MEDIA_CONNECTOR', 'PREVIEW_ERROR_URL'])],
    server: {
        port: 3002,
    },
    base: './',
    optimizeDeps: {
        include: ['@chili-publish/grafx-shared-components', '@chili-publish/studio-sdk'],
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
