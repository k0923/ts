import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@components': resolve(__dirname, './src/components'),
            '@hooks': resolve(__dirname, './src/hooks'),
            '@utils': resolve(__dirname, './src/utils'),
            '@types': resolve(__dirname, './src/types'),
            '@assets': resolve(__dirname, './src/assets'),
        },
    },
    plugins: [
        react(),
        dts({
            include: ['src'],
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'form',
            formats: ['es', 'umd'],
            fileName: format => `form.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'lodash'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    lodash: '_',
                },
            },
        },
    },
})
