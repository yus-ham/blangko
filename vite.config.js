import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
// import { devServer } from './config/.js';
// import restApi from './src_api';
import routify from '@roxi/routify/vite-plugin';


const {PORT, NODE_ENV} = process.env;
const globals = {API_URL: '/api', BASE_URL: ''};
const dev = NODE_ENV !== 'production';

for (let ENV_VAR in globals) {
    if (process.env[ENV_VAR]) {
        globalThis[ENV_VAR] = process.env[ENV_VAR];
    }
}

globalThis.SESS_API_URL || (globalThis.SESS_API_URL = (dev ? '/api' : globalThis.API_URL) + '/auth/session')

export default defineConfig({
    base: globalThis.BASE_URL||'/',
    plugins: [
        routify({
            routesDir: {default: 'src_front/pages'},
            devHelper: dev,
        }),
        svelte(),
        // dev && restApi()
    ],
    resolve: {
        alias: {'~': `${__dirname}/src_front`}
    },

    server: {...devServer, port: PORT||devServer.port},
})
