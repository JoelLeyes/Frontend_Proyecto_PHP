import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
    },
    preview: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        allowedHosts: ['app.agendaonline.cloud-ip.cc', 'api.agendaonline.cloud-ip.cc', 'localhost', '127.0.0.1'],
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: '/index.html',
        },
    },
})
