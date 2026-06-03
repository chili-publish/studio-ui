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
    resolve: {
        dedupe: [
            'react',
            'react-dom',
            'styled-components',
            'react-dnd',
            'react-dnd-html5-backend',
            'react-dnd-touch-backend',
            'dnd-core',
            'react-select',
            'react-datepicker',
            'date-fns',
            '@fortawesome/fontawesome-svg-core',
            '@fortawesome/react-fontawesome',
            '@fortawesome/pro-light-svg-icons',
            '@fortawesome/pro-regular-svg-icons',
            '@fortawesome/pro-solid-svg-icons',
        ],
        alias: {
            'react/jsx-runtime.js': 'react/jsx-runtime',
            'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime',
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
