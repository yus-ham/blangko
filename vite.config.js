import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import routify from '@roxi/routify/vite-plugin';


const dev = process.env.BUN_ENV !== 'production';

globalThis.BASE_URL = process.env.BASE_URL||'/';
globalThis.API_URL = process.env.BASE_URL||'/api';


export default defineConfig({
    base: globalThis.BASE_URL||'/',
    plugins: [
        routify({
            routesDir: {default: 'src_front/pages'},
            devHelper: dev,
        }),
        svelte(),
    ],
    resolve: {
        alias: {'~': `${__dirname}/src_front`}
    },
})
