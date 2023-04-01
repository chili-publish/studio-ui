import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3002,
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
