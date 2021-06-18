import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import restApi from './src_api';
import config from './config.env.json';

const __dir = _ => {
    try { return __dirname } catch(e) {}
    return import.meta.url.replace('file://', '').split('?')[0].replace('/vite.config.js', '')
}

Object.entries(config.globals||{}).forEach(([key, value]) => globalThis[key] = value)

if (process.env.PORT) {
    config.server.port = process.env.PORT;
}


export default defineConfig({
    server: config.server,

    plugins: [
        restApi(),
        svelte(),
    ],

    resolve: {
        alias: [
            {find: '~', replacement: __dir() +'/src_front'}
        ]
    },
});
