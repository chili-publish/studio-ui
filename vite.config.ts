import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

// https://vitejs.dev/config/
export default ({ mode }) => {
    const outputFormat = process.env.OUTPUT_FORMAT;
    if (mode !== 'development' && outputFormat !== 'iife' && outputFormat !== 'module') {
        process.exit(1);
    }
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
            alias: { 'react/jsx-runtime.js': 'react/jsx-runtime' },
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
