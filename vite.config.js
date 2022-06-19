import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
// import { devServer } from './config/.js';
// import restApi from './src_api';


const {PORT, NODE_ENV} = process.env;
const globals = {API_URL: '/api', BASE_URL: ''};
const dev = NODE_ENV !== 'production';

for (let ENV_VAR in globals) {
    if (process.env[ENV_VAR]) {
        globalThis[ENV_VAR] = process.env[ENV_VAR];
    }
}


export default defineConfig({
    base: globalThis.BASE_URL||'/',
    // server: {...devServer, port: PORT||devServer.port},
    server: {},
    plugins: [
        svelte(),
        // dev && restApi()
    ],
    resolve: {
        alias: {'~': __dirname +'/src_front'}
    },
    build: {emptyOutDir: false}
});
