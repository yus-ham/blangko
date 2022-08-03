import Bun from 'bun';
import path from 'path';
import fs from 'fs';
import cookie from 'cookie';
import common from './lib/common';


type Context = {req: Request, parsedUrl: URL}

const  serviceCache = {}

async function serveResource(ctx: Context) {
    if (ctx.parsedUrl.pathname.slice(0, 4) !== '/api') {
        return;
    }

    try {
        await parse(ctx)
        let { Service, allows, resCode, args } = await getActionMeta(ctx)

        if (!Service) {
            return new Response('', {status: 404})
        }

        const action = Service['onRequest' + ctx.req.method[0] + ctx.req.method.slice(1).toLowerCase()]

        if (!action) {
            return new Response('', {
                status: 405,
                headers: {'Allow': allows.join(', ')}
            })
        }

        for (let key in args) {
            ctx.parsedUrl.searchParams.set(key, args[key])
        }

        const result = await action({...common, req: ctx.req, params: ctx.parsedUrl.searchParams})
        return new Response(postAction(result), {status: resCode})
    } catch (err) {
        if (err && err.name === 'ResolveError') {
            return;
        }

        return new Response('', {status: err.code})
    }
}

function postAction(result) {
    return result ? JSON.stringify(result) : '';
}



const parsers = {
    'application/json': req => req.text(text  => JSON.parse(text || "null")),
    'application/x-www-form-urlencoded': req => req.text(parseQs),
    'multipart/form-data': parseFormData,
}

function parseQs(qs) {
    const data = new URLSearchParams(qs)
    return [...data].reduce((prev, pair) => {
      prev[pair[0]] = pair[1]
      return prev
    }, {})
}

async function parseFormData(req) {
    const reader = await req.blob().then(blob => blob.stream().getReader())
    return new Promise((resolve) => {
        let data = '';

        const processChunk = ({done, chunk}) => {
            if (done) {
                return resolve(new URLSearchParams(data))
            }
            data += new TextDecoder().decode(chunk)
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
            ctx.req.body = await parsers[req.headers.get('content-type')](ctx.req)
            resolve()
        })
    }
}

async function getActionMeta(ctx: Context) {
    let dir = path.join(__dirname, 'services')
    let route = ctx.parsedUrl.pathname.slice(4)
    let id, Service = serviceCache[route];
    let allows;

    if (!Service) {
        Service = serviceCache[route] = (await import(dir + route)).default;

        if (!Service) {
            const slashPos = route.lastIndexOf('/')

            if (slashPos > 1) {
                id = route.slice(slashPos + 1)
                route = route.slice(0, slashPos)
                Service = serviceCache[route] = (await import(dir + route)).default;
            }
        }

        allows = [];
        for (let _method of ['Get', 'Post', 'Put', 'Patch', 'Delete']) {
            if (Service['onRequest'+_method]) {
                allows.push(_method.toUpperCase())
            }
        }
    }

    let resCode = 200;
    let args = {}

    if (['GET', 'PATCH', 'DELETE'].includes(ctx.req.method)) args.id = id;
    if (ctx.req.method === 'POST') resCode = 201;
    else if (ctx.req.method === 'DELETE') resCode = 204;

    return { Service, resCode, allows, args }
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
        return result.then(res => {
            return res || runMiddleware(fns, ctx)
        })
    }
}


console.log('Server running on localhost:3000');

export default {
    fetch(req: Request) {
        console.info('FetchEvent:',req.url)
        const ctx = {req, parsedUrl: new URL(req.url)}

        return runMiddleware([
            serveStatic,
            serveResource,
            _ => new Response(Bun.file(root + '/index.html'))
        ], ctx)

    },

    error(err: Error) {
        console.error('default.error',err)
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
