import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import restApi from './src_api/index.js';

const __dir = _ => {
    try { return __dirname } catch(e) {}
    return import.meta.url.replace('file://', '').split('?')[0].replace('/vite.config.js', '')
}

const globals = {API_URL: '/api', BASE_URL: ''};
const server = {};

Object.entries(globals||{}).forEach(([key, value]) => globalThis[key] = value)


process.env.PORT && (server.port = process.env.PORT);
process.env.BASE_URL && (globalThis.BASE_URL = process.env.BASE_URL);
process.env.API_URL && (globalThis.API_URL = process.env.API_URL);


export default defineConfig({
    server,

    plugins: [
        restApi(),
        svelte(),
        // copy({targets: [{src: './src_api/*', dest: './dist/functions/api'}], verbose: true})
    ],

    resolve: {
        alias: {'~': __dir() +'/src_front'}
    },
});
