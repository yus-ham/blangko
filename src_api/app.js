const middlewares = [serveResource, serveStatic]
const next = err => { if (err) throw err; }

module.exports = async function (req, res) {
  let out, fn;

  for (fn of middlewares) {
    if (!res.finished) {
      out = await fn(req, res, next) || out;
    }
  }

  return out;
}


module.exports.serveResource = serveResource;
async function serveResource(req, res, next) {
  if (req._parsedUrl.pathname.slice(0, 4) !== '/api') {
    return next && next();
  }

  try {
    const ctx = await parse(req, res)
    const {Service, allows, resCode, args} = getActionMeta(req)
    const action = Service[req.method.toLowerCase()]

    if (!action) {
      res.statusCode = 405;
      allows.length && res.setHeader('Allow', allows.join(', '))
      return res.end()
    }

    const result = await action.apply({...ctx, ...Service}, args)
    res.statusCode = resCode;
    res.end(postAction(ctx, result))
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      res.statusCode = 404;
    } else {
      res.statusCode = err.code||500;
      console.error(err)
    }
    res.end()
  }
}

function postAction(ctx, res) {
  if (!res) {
    return '';
  }
  if (res.preResponse) {
    res.preResponse(ctx.res)
  }
  return JSON.stringify(res)
}

const path = require('path');
const cookie = require('cookie');
const common = require('./lib/common');
const form = require('formidable')({multiples: true});
const services = {};

async function parse(req, res) {
  let ctx = {req, res, ...common}
  ctx.cookies = cookie.parse(req.headers.cookie||'')
  ctx.params = parseQs(req._parsedUrl.query)

  if (['POST','PATCH','PUT'].includes(req.method)) {
    await new Promise((resolve) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          next({code: err.httpCode || 400})
        }

        ctx.files = files;
        ctx.body = fields;
        resolve()
      })
    })
  }

  return ctx;
}

function parseQs(qs) {
  const data = new URLSearchParams(qs)
  return [...data].reduce((prev, pair) => {
    prev[pair[0]] = pair[1]
    return prev
  }, {})
}

function getActionMeta(req) {
  let dir = path.join(__dirname, 'services')
  let route = req._parsedUrl.pathname.slice(4)
  let id, Service = services[route];
  let allows = [];

  if (!Service) {
    try {
      Service = services[route] = require(dir + route)
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        next(err)
      }

      const slashPos = route.lastIndexOf('/')

      if (slashPos < 0) {
        next(err)
      }

      id = route.slice(slashPos + 1)
      route = route.slice(0, slashPos)
      Service = services[route] = require(dir + route)
    }

    allows = [];
    for (let _method of ['get', 'post', 'put', 'patch', 'delete']) {
      if (Service[_method]) {
        allows.push(_method.toUpperCase())
      }
    }
  }

  let resCode = 200;
  let args = [];

  if (['GET','PATCH','DELETE'].includes(req.method)) args = [id];
  if (req.method === 'POST') resCode = 201;
  else if (req.method === 'DELETE') resCode = 204;  

  return {Service, resCode, allows, args}
}


const sendStream = require('send');
const root = require('path').join(__dirname, '/../dist');

function serveStatic(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    next({code: 405})
  }

  return new Promise(resolve => {
    let stream = sendStream(req, req._parsedUrl.pathname, { root })

    stream.on('error', err => {
      if (err.status !== 404) {
        next(err)
      }

      let dir = err.path.slice(0, err.path.lastIndexOf('/'))
      if (dir === err.path) {
        next(err)
      }

      return stream.sendIndex(root)
    })

    stream.on('end', _ => res.end())
    stream.pipe(res)
  })  
}
