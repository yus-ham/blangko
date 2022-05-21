let vite;


const identity = {
  username: 'admin',
  password: 123456789,
  role: 'Administrator',
}

const endpoints = {
  '/auth/session': {
    GET(req, res) {
      if (req.cookies.rt) {
        data = {token: btoa(Date.now()), identity}
        res.end(JSON.stringify(data))
      } else {
        res.statusCode = 401;
        res.end()
      }
    },

    POST(req, res) {
      if (req.body.username !== identity.username || req.body.password != identity.password) {
        return res.validationError('{"password":"Invalid username or password"}')
      }

      const refresh_token = btoa(String(Date.now()).split('').reverse().join())
      res.setHeader('Set-Cookie', 'rt='+ refresh_token)

      res.end(JSON.stringify({
        token: btoa(Date.now()),
        refresh_token,
        identity
      }))
    },

    DELETE(req, res) {
      delete cookie.rt
      res.statusCode = 204;
      res.setHeader('Set-Cookie', 'rt=; Max-Age=0')
      res.end()
    }
  },


  '': {
    GET(req, res) {
      res.end(Object.entries(endpoints).reduce((prev, [uri, handler]) => prev += '<a href=/api' + uri + '>' + uri + '</a><br>', ''))
    }
  }
}

function parseQs(qs) {
  const data = new URLSearchParams(qs)
  return [...data].reduce((prev, pair) => {
    prev[pair[0]] = pair[1]
    return prev
  }, {})
}

const parsers = {
  'application/json': text => JSON.parse(text || "null"),
  'application/x-www-form-urlencoded': parseQs,
}

module.exports = function () {
  return {
    configureServer: function (_vite) {
      vite = _vite

      vite.middlewares.use('/api', async(req, res, next) => {
        if (req.method !== 'GET') {
          const text = (await require('raw-body')(req)).toString()
          req.body = text ? parsers[req.headers['content-type']](text) : null
        }

        req.cookies = {};
        String(req.headers.cookie).split('; ').forEach(x => {
          x = x.split('=');
          req.cookies[x[0]] = x[1];
        });

        res.validationError = resBody => {
          res.statusCode = 422
          res.end(resBody)
        }

        next()
      })

      Object.entries(endpoints).forEach(([uri, handler]) => {
        vite.middlewares.use('/api' + uri, (req, res) => {
          if (handler[req.method]) {
            handler[req.method](req, res)
          } else if (uri) {
            res.statusCode = 405;
            res.end()
          } else {
            res.statusCode = 404;
            res.end()
          }
        })
      })
    }
  }
}
