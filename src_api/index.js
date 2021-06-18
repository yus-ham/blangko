let vite;

const cookie = {}

const identity = {
  username: 'admin',
  password: 123456789,
  role: 'Administrator',
}

const endpoints = {
  '/auth/session': {
    GET(req, res) {
      if (cookie.rt) {
        res.end(JSON.stringify({token: btoa(Date.now()), identity}))
      } else {
        res.statusCode = 401;
        res.end()
      }
    },

    POST(req, res) {
      if (req.body.get('username') !== identity.username || req.body.get('password') != identity.password) {
        res.statusCode = 422;
        return res.end('{"password":"Invalid username or password"}')
      }

      const refresh_token = btoa(String(Date.now()).split('').reverse().join())
      res.setHeader('Set-Cookie', 'rt='+ refresh_token)

      return res.end(JSON.stringify({
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

const parsers = {
  'application/json': text => JSON.parse(text || "null"),
  'application/x-www-form-urlencoded': text => new URLSearchParams(text)
}

module.exports = function () {
  return {
    configureServer: function (_vite) {
      vite = _vite

      vite.middlewares.use('/api', async(req, res, next) => {
        const text = (await require('raw-body')(req)).toString()
        req.body = text ? parsers[req.headers['content-type']](text) : null
        next()
      })

      vite.middlewares.use('/api', (req, res, next) => {
        String(req.headers.cookie).split('; ').forEach(x => {
          x = x.split('=');
          cookie[x[0]] = x[1];
        });
        next()
      })

      Object.entries(endpoints).forEach(([uri, handler]) => {
        vite.middlewares.use('/api' + uri, (req, res) => {
          endpoints[uri][req.method](req, res)
        })
      })
    }
  }
}
