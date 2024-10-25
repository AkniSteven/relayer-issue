import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
const timestamp = new Date().getTime();

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({ globals: { global: true } })
    ],
    build: {
        outDir: 'public',
        rollupOptions: {
            input: 'app.js',
            output: {
                entryFileNames: `main.js`,
                format: 'iife',
                dir: 'public',
            },
        },
        minify: false,
    },
    define: {
        'process.env': {},
        global: 'globalThis',
    },
});
