import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { Context, serveResource } from './src_api/app.js';
import routify from '@roxi/routify/vite-plugin';
import querystring from 'node:querystring';


const {PORT : port = 5000, BUN_ENV} = process.env;
const dev = BUN_ENV !== 'production';

globalThis.BASE_URL = process.env.BASE_URL||'/';
globalThis.API_URL = process.env.BASE_URL||'/api';


globalThis.SESS_API_URL || (globalThis.SESS_API_URL = (dev ? '/api' : globalThis.API_URL) + '/auth/session')

export default defineConfig({
    base: BASE_URL||'/',
    plugins: [
        routify({
            routesDir: {default: 'src_front/pages'},
            // devHelper: dev,
        }),
        svelte(),
        dev && {
            configureServer: function (vite) {
                vite.middlewares.use('/api', async (req, res) => {
                    req.headers.get = (k) => req.headers[k]
                    req.url = `http://${req.rawHeaders[1]}${req.originalUrl}`;

                    let data = '';
                    req.on('data', chunk => data += chunk.toString())

                    req.formData = async() => {
                        return {toJSON: _ => querystring.parse(data)}
                    }

                    req.clientID = req.socket.remoteAddress

                    try {
                        const respon = await serveResource(new Context(req))

                        for (let [key, value] of respon.headers.entries()) {
                            res.setHeader(key, value)
                        }

                        res.writeHead(respon.status || 404)
                        res.end(await respon.text())
                    }
                    catch(err) {
                        console.error({err})

                        res.writeHead(err.status ||404, err.statusText)
                        res.end(JSON.stringify(err.detail))
                    }
                })
            }
        }
    ],
    resolve: {
        alias: {'~': `${__dirname}/src_front`}
    },
    server: {port},
})
