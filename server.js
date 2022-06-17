const middlewares = [serveSession, serveStatic]
const next = err => { if (err) throw err; }

module.exports = async function (req, res) {
  try {
    let out, fn;
    for (fn of middlewares) {
      if (!res.finished) {
        out = await fn(req, res, next) || out;
      }
    }
    return out;
  } catch (err) {
    if (!err.code || err.code >= 500 || err.code < 200) {
      console.error(err)
    }
    res.statusCode = err.code || 500;
    res.end()
  }
}


const send = require('@polka/send-type');

module.exports.serveSession = serveSession;
function serveSession(req, res, next) {
  if (req._parsedUrl.pathname !== '/api/auth/session') {
    return next && next();
  }

  return parse(req, res).then(ctx => {
    return ({
      async GET() {
        if (!ctx.cookies.rt) {
          return send(ctx.res, 401)
        }

        const apiRes = await sessionApiRequest({
          type: 'refresh_token',
          password: ctx.cookies.rt
        })

        if (apiRes.statusCode >= 400) {
          return send(ctx.res, 401)
        }

        send(ctx.res, 201, apiRes.data, {'Set-Cookie': 'rt=' + apiRes.json().refresh_token + '; HttpOnly=true'})
      },

      async POST() {
        const apiRes = await sessionApiRequest({ ...ctx.body, type: 'basic' })

        if (apiRes.statusCode === 422) {
          return send(ctx.res, 422, apiRes.data)
        }

        const headers = {}
        if (apiRes.statusCode === 201) {
          headers['Set-Cookie'] = 'rt=' + apiRes.json().refresh_token + '; HttpOnly=true';
        }

        send(ctx.res, apiRes.statusCode, apiRes.data, headers)
      },

      async DELETE() {
        send(ctx.res, 204, '', {'Set-Cookie': 'rt=; Max-Age=0; HttpOnly=true' })
      }
    })[req.method]()
  })
}

async function parse(req, res) {
  const ctx = {req, res, cookies: parseCookies(req)};

  if (req.method === 'POST') {
    ctx.body = await new Promise((resolve) => {
      req.on('data', (chunk) => {
        const data = {}, body = chunk.toString().split('&')
        for (let param of body) {
          let [name, value] = param.split('=')
          data[name] = decodeURIComponent(value)
        }
        resolve(data)
      })
    })
  }

  return ctx;
}

function parseCookies(req) {
  let cookies = String(req.headers.cookie).split('; ')
  let result = {};

  for (let cookie of cookies) {
    let [key, value] = cookie.split('=')
    if (!result[key]) {
      result[key] = value;
    }
  }

  return result;
}

const { request } = require('http');
const { sessionApi } = require('./config.js');

function sessionApiRequest(body = null) {
  const opts = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + sessionApi.key,
      'Content-Type': 'application/json'
    },
  }

  return new Promise((resolve) => {
    const req = request(sessionApi.baseUrl + '/auth/session', opts, res => {
      res.data = '';
      res.on('data', (chunk) => res.data += chunk.toString())
      res.on('end', _ => {
        res.json = _ => JSON.parse(res.data)
        resolve(res)
      })
    })

    req.write(JSON.stringify(body))
    req.end()
  })
}


const sendStream = require('send');
const root = __dirname + '/dist';

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
