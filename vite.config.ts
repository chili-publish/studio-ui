import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default ({ mode }) => {
    const outputFormat = process.env.OUTPUT_FORMAT;
    if (mode !== 'development' && outputFormat !== 'iife' && outputFormat !== 'module') {
        process.exit(1);
    }
    return defineConfig({
        plugins: [react(), cssInjectedByJsPlugin()],
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
                input:
                    mode === 'development'
                        ? {
                              index: './src/main.tsx',
                              bootstrap: './src/_dev-execution/bootstrap.ts',
                          }
                        : {
                              index: outputFormat === 'iife' ? './src/index.ts' : './src/es-index.ts',
                          },
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
};
