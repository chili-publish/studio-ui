import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

// https://vitejs.dev/config/
export default ({ mode }) => {
    return defineConfig({
        plugins: [react(), EnvironmentPlugin(['NODE_ENV', 'PREVIEW_ERROR_URL'])],
        server: {
            port: 3002,
        },
        base: './',
        optimizeDeps: {
            // To debug linked version of '@chili-publish/grafx-shared-components', exclude it from this array
            include: ['@chili-publish/grafx-shared-components', '@chili-publish/studio-sdk'],
        },
        resolve: {
            // force Vite to always resolve listed dependencies to the same copy (from project root).
            dedupe: ['react', 'react-dom'],
        },
        build: {
            emptyOutDir: true,
            rollupOptions: {
                input:
                    mode === 'development'
                        ? {
                              index: './src/main.tsx',
                              bootstrap: './src/_dev-execution/bootstrap.ts',
                          }
                        : {
                              index: './src/main.tsx',
                          },
                output: {
                    entryFileNames: 'bundle.js',
                    chunkFileNames: 'bundle.js',
                    assetFileNames: 'main.[ext]',
                    format: 'iife',
                },
            },
        },
    });
};
