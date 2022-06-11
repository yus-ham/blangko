const http = require('http');
const { sessionApi } = require('./config.js');


function sessionApiRequest(body = null) {
  const opts = {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + sessionApi.key,
      'Content-Type': 'application/json'
    },
  }

  return new Promise((resolve, reject) => {
    const req = http.request(sessionApi.baseUrl + '/auth/session', opts, res => {
      res.data = '';
      res.on('data', (chunk) => res.data += chunk.toString())
      res.on('end', _ => {
        res.json = _ => JSON.parse(res.data)
        resolve(res)
      })
    })

    req.on('error', reject)
    req.write(JSON.stringify(body))
    req.end()
  })
}

async function parse(req, res) {
  const ctx = { req, res };

  parseCookies(ctx)

  if (req.method === 'POST') {
    req.body = await new Promise((resolve) => {
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

  ctx.respond = function (code, { status, headers = {}, data } = {}) {
    ctx.res.writeHead(code, status || headers, headers)
    ctx.res.end(data || '')
  }

  return ctx;
}


const serveStatic = require('serve-static')(__dirname + '/dist')

module.exports = function (req, res) {
  return new Promise(resolve => {
    res.on('close', resolve)
    serveSessionApi(req, res)
    serveStatic(req, res, _ => void 0)
  })
  .catch(err => {
    console.error(err)
  })
}

module.exports.parseCookies = parseCookies;
function parseCookies(ctx) {
  ctx.req.cookies = {};
  const cookies = String(ctx.req.headers.cookie || '').split('; ')
  for (let cookie of cookies) {
    let [name, value] = cookie.split('=')
    if (!(name in ctx.req.cookies)) {
      ctx.req.cookies[name] = value;
    }
  }
}

module.exports.serveSessionApi = serveSessionApi;
function serveSessionApi(req, res, next) {
  if (req.url !== '/api/auth/session') {
    return next && next();
  }

  parse(req, res)
  .then(ctx => {
    ({
      async GET() {
        if (!req.cookies.rt) {
          return ctx.respond(401)
        }

        const apiRes = await sessionApiRequest({
          type: 'refresh_token',
          password: req.cookies.rt
        })

        if (apiRes.statusCode >= 400) {
          return ctx.respond(401)
        }

        ctx.respond(201, {
          headers: { 'Set-Cookie': 'rt=' + apiRes.json().refresh_token + '; Path=/api; HttpOnly=true' },
          data: apiRes.data
        })
      },

      async POST() {
        const apiRes = await sessionApiRequest({ ...req.body, type: 'basic' })

        if (apiRes.statusCode === 422) {
          return ctx.respond(422, { status: 'Data Validation Failed', data: apiRes.data })
        }

        const headers = {}
        if (apiRes.statusCode === 201) {
          headers['Set-Cookie'] = 'rt=' + apiRes.json().refresh_token + '; Path=/api; HttpOnly=true';
        }

        ctx.respond(apiRes.statusCode, { headers, data: apiRes.data })
      },

      async DELETE() {
        ctx.respond(204, { headers: { 'Set-Cookie': 'rt=; Path=/api; Max-Age=0; HttpOnly=true' } })
      }
    })[req.method]()
  })
}
