import { defineConfig, mergeConfig } from 'vite';
import { baseConfig } from './vite.base.config';

// https://vitejs.dev/config/
export default ({ mode }) => {
    const outputFormat = process.env.OUTPUT_FORMAT;
    // const buildForPlaywrightTests = process.env.BUILD_FOR_PLAYWRIGHT_TESTS;
    // Only validate OUTPUT_FORMAT during build, not during preview
    if (mode !== 'development' && outputFormat !== 'iife' && outputFormat !== 'module') {
        process.exit(1);
    }
    return defineConfig(
        mergeConfig(baseConfig(outputFormat), {
            build: {
                rollupOptions: {
                    input:
                        mode === 'development'
                            ? {
                                  index: './src/main.tsx',
                                  bootstrap: './src/_dev-execution/bootstrap.ts',
                              }
                            : {
                                  index: outputFormat === 'iife' ? './src/index.ts' : './src/es-index.ts',
                              },
                },
            },
        }),
    );
};
