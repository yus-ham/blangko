import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { globals, server } from './config.env.json';
import restApi from './src_api';

const __dir = _ => {
    try { return __dirname } catch(e) {}
    return import.meta.url.replace('file://', '').split('?')[0].replace('/vite.config.js', '')
}

const {PORT, API_URL, BASE_URL, NODE_ENV} = process.env;
const isProd = NODE_ENV === 'production';
const plugins = [svelte()];

isProd || plugins.push(restApi());

Object.entries(globals||{}).forEach(([key, value]) => globalThis[key] = value);

PORT && (server.port = PORT);
API_URL && (globalThis.API_URL = API_URL);
BASE_URL && (globalThis.BASE_URL = BASE_URL);
globalThis.BASE_URL = globalThis.BASE_URL.replace(/\/+$/, '');

export default defineConfig({
    base: globalThis.BASE_URL||'/',
    server,
    plugins,
    resolve: {
        alias: [
            {find: '~', replacement: __dir() +'/src_front'}
        ]
    },
    build: {emptyOutDir: false}
});
