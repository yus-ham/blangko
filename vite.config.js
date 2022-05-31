import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { globals, server } from './config.env.json';
import restApi from './src_api';

const __dir = _ => {
    try { return __dirname } catch(e) {}
    return import.meta.url.replace('file://', '').split('?')[0].replace('/vite.config.js', '')
}

const isProd = process.env.NODE_ENV === 'production';
const plugins = [svelte()];

isProd || plugins.push(restApi());

Object.entries(globals||{}).forEach(([key, value]) => globalThis[key] = value);

process.env.PORT && (server.port = process.env.PORT);
process.env.API_URL && (globalThis.API_URL = process.env.API_URL);
process.env.BASE_URL && (globalThis.BASE_URL = process.env.BASE_URL);
globalThis.BASE_URL = globalThis.BASE_URL.replace(/\/+$/, '');

export default defineConfig({
    server,
    plugins,
    resolve: {
        alias: [
            {find: '~', replacement: __dir() +'/src_front'}
        ]
    },
    build: {emptyOutDir: false}
});
