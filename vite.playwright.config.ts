import { defineConfig, mergeConfig } from 'vite';
import { baseConfig } from './vite.config';
import path from 'path';

export default () => {
    const viteBaseConfig = baseConfig('module');
    return defineConfig(
        mergeConfig(viteBaseConfig, {
            build: {
                rollupOptions: {
                    input: path.resolve(__dirname, 'index.html'),
                    output: { ...viteBaseConfig.build.rollupOptions.output, dir: 'dist' },
                },
            },
        }),
    );
};
