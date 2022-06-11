import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { devServer } from './config.js';
import restApi from './src_api';


const {PORT, NODE_ENV} = process.env;
const dev = NODE_ENV !== 'production';

for (let ENV_VAR in globalThis) {
    if (process.env[ENV_VAR]) {
        globalThis[ENV_VAR] = process.env[ENV_VAR];
    }
}


export default defineConfig({
    base: globalThis.BASE_URL||'/',
    server: {...devServer, port: PORT||devServer.port},
    plugins: [
        svelte(),
        dev && restApi()
    ],
    resolve: {
        alias: [{find:'~', replacement: __dirname +'/src_front'}]
    },
    build: {emptyOutDir: false}
});
