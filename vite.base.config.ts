import react from '@vitejs/plugin-react';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export const baseConfig = (outputFormat?: string) => ({
    plugins: [
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        cssInjectedByJsPlugin(),
    ],
    server: {
        port: 3002,
    },
    base: './',
    optimizeDeps: {
        // To debug linked version of '@chili-publish/grafx-shared-components', exclude it from this array
        include: [],
    },
    resolve: {
        // force Vite to always resolve listed dependencies to the same copy (from project root).
        dedupe: ['react', 'react-dom'],
        alias: {
            'react/jsx-runtime.js': 'react/jsx-runtime',
            src: path.resolve(__dirname, './src'),
        },
    },
    build: {
        emptyOutDir: true,
        rollupOptions: {
            preserveEntrySignatures: 'exports-only',
            output:
                outputFormat === 'iife'
                    ? {
                          entryFileNames: 'bundle.js',
                          chunkFileNames: 'bundle.js',
                          assetFileNames: 'main.[ext]',
                          format: 'iife',
                      }
                    : {
                          entryFileNames: 'bundle.js',
                          chunkFileNames: 'chunk.[name].js',
                          assetFileNames: 'main.[ext]',
                          format: 'es',
                          dir: 'dist/es-module',
                      },
        },
    },
});
