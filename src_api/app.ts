import Bun from 'bun';
import path from 'path';
import fs from 'fs';
import cookie from 'cookie';
import '../config.ts';


class Context {
    constructor(req: Request) {
        this.req = req;
        this.parsedUrl = new URL(req.url)

        const res = {status: 200}

        this.res = () => res;
        this.res.headers = new Headers()
        this.res.beforeSend = []
        this.res.status = (code) => {
            res.status = code;
            return this.res
        }
        this.res.cookie = (key: string, value = '', opts = {}) => {
            let cookieStr;
            opts.path = globalThis.API_URL;
            if (!value) {
                cookieStr = `${key}=; Path=${opts.path}; MaxAge=0; HttpOnly`;
            } else {
                opts.httpOnly = true;
                cookieStr = cookie.serialize(key, value, opts)
            }
            this.res.headers.append('Set-Cookie', cookieStr)
            return this.res
        }
    }
}


async function serveResource(ctx) {
    if (ctx.parsedUrl.pathname.slice(0, 4) !== globalThis.API_URL) {
        return;
    }

    await parse(ctx)
    const { service, actionArgs } = await getService(ctx)

    if (!service) {
        return new Response('', {status: 404})
    }

    const action = 'onRequest' + ctx.req.method[0] + ctx.req.method.slice(1).toLowerCase()

    if (!service[action]) {
        return new Response('', {
            status: 405,
            headers: {Allow: getAllowedMethods(service)}
        })
    }

    if (['GET', 'PATCH', 'DELETE'].includes(ctx.req.method) && actionArgs.id) {
        ctx.req.params.set('id', actionArgs.id)
    }

    ctx.res.data = await service[action](ctx.req, ctx.res)
    const res = ctx.res();

    if (res.status >= 400) {
        ctx.res.data = '';
    } else {
        service.afterAction(ctx)
    }

    return new Response(ctx.res.data, {
        status: res.status || {POST:201, DELETE:204}[ctx.req.method] || 200,
        headers: ctx.res.headers
    })
}

function getAllowedMethods(service) {
    if (!service.actions) {
        service.actions = []
        for (let _method of ['Get', 'Post', 'Put', 'Patch', 'Delete']) {
            if (service['onRequest'+_method]) {
                service.actions.push(_method.toUpperCase())
            }
        }
        service.actions = service.actions.join(', ')
    }
    return service.actions
}


const parsers = {
    'application/json': req => req.text().then(json  => JSON.parse(json || "null")),
    'application/x-www-form-urlencoded': req => req.text().then(parseQs),
    'multipart/form-data': parseFormData,
}

function parseQs(qs) {
    const result = {};
    (new URLSearchParams(qs)).forEach((value, key) => {
        result[key] = value
    })
    return result
}

async function parseFormData(req) {
    const reader = await req.blob().then(blob => blob.stream().getReader())
    return new Promise((resolve) => {
        let data = '';

        const processChunk = ({done, chunk}) => {
            if (done) {
                return resolve(new URLSearchParams(data))
            }
            data += (new TextDecoder).decode(chunk)
            reader.read().then(processChunk)
        }

        reader.read().then(processChunk)
    })
}

async function parse(ctx: Context) {
    ctx.req.cookies = cookie.parse(ctx.req.headers.get('cookie') || '')
    ctx.req.params = ctx.parsedUrl.searchParams

    if (['POST', 'PATCH', 'PUT'].includes(ctx.req.method)) {
        return new Promise(async(resolve) => {
            ctx.req.body = await parsers[ctx.req.headers.get('content-type')](ctx.req)
            resolve()
        })
    }
}


const services = {}

async function getService(ctx) {
    let dir = path.join(__dirname, 'services')
    let route = ctx.parsedUrl.pathname.slice(4)
    let service = services[route]
    let actionArgs = {}

    if (!service) {
        service = services[route] = await import(dir + route).then(prepareService).catch(err => void 0)
        if (!service) {
            const slashPos = route.lastIndexOf('/')
            if (slashPos > 1) {
                actionArgs.id = route.slice(slashPos + 1)
                route = route.slice(0, slashPos)
                service = services[route] = await import(dir + route).then(prepareService).catch(err => void 0)
            }
        }
    }

    return {service, actionArgs}
}

function prepareService(x) {
    x.default.afterAction = (ctx) => {
        ctx.res.beforeSend.forEach(fn => fn())
        jsonResponse(ctx.res)
    }
    return x.default
}

function jsonResponse(res) {
    res.headers.set('Content-Type', 'application/json')
    res.data = JSON.stringify(res.data)
}


const root = path.join(__dirname, '/../dist')

function serveStatic(ctx: Context) {
    const file = root + ctx.parsedUrl.pathname;

    try {
        if (fs.statSync(file).isFile()) {
            return new Response(Bun.file(file))
        }
    } catch (err) {
        // console.error('error serveStatic', {...err, file})
    }
}

function runMiddleware(fns: Function[], ctx: Context) {
    if (!fns.length) {
        return;
    }

    // @ts-ignore
    const result = fns.shift().call({}, ctx)

    if (!result) {
        return runMiddleware(fns, ctx)
    }

    if (result instanceof Response) {
        return result;
    }

    if (result && result.then) {
        return result
            .then(res => res || runMiddleware(fns, ctx))
            .catch(err => {
                if (!err.status) {
                    console.error(err)
                    err.status = 500;
                    err.detail = err.message;
                } else {
                    err.detail = afterAction(err.detail)
                }
                return new Response(err.detail, err)
            })
    }
}


console.log('Server running on localhost:3000');

export default {
    fetch(req: Request) {
        console.info('FetchEvent:',req.url)
        const ctx = new Context(req)

        return runMiddleware([
            serveStatic,
            serveResource,
            _ => new Response(Bun.file(root + '/index.html'))
        ], ctx)
    },

    // this is called when fetch() throws or rejects
    // error(err: Error) {
    // return new Response("uh oh! :(" + String(err.toString()), { status: 500 });
    // },

    // this boolean enables the bun's default error handler
    // sometime after the initial release, it will auto reload as well
    development: process.env.NODE_ENV !== "production",
    // note: this isn't node, but for compatibility bun supports process.env + more stuff in process

    // SSL is enabled if these two are set
    // certFile: './cert.pem',
    // keyFile: './key.pem',

    port: 3000, // number or string
    hostname: "localhost", // defaults to 0.0.0.0
}
