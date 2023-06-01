import { serveResource } from './app.js';


console.info({
    env2: process.env
})

export async function onRequest({ request, next }) {
    const _parsedUrl = new URL(request.url)

    if (_parsedUrl.pathname.slice(0, 5) !== '/api/') {
        return next()
    }

    const req = {
        _parsedUrl,
        method: request.method,
        headers: [...request.headers].reduce((prev, [key, value]) => (prev[key] = value, prev), {}),
        on(type, fn) {
            if (type === 'data') {
                request.text().then(data => {
                    fn(data)
                })
            }
            else if (type === 'end') {
                // setTimeout(fn, 100)
                setTimeout(_ => { fn() }, 100)
            }
        }
    }

    const headers = {};
    const res = {
        setHeader(key, value) {
            headers[key] = value;
        },
        end(data) {
            this.data = data;
        },
    }

    await serveResource(req, res, next)
    return new Response(res.data, { status: res.statusCode || 500, headers })
}