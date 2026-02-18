import { defineConfig, mergeConfig } from 'vite';
import path from 'path';
import { baseConfig } from './vite.base.config';

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
