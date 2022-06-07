let vite;
let dataMember = require('./data.json')


const identity = {
  username: 'admin',
  password: 123456789,
  role: 'Administrator',
}


const endpoints = {
  '/crud/member': {
    GET(req, res) {
      let data = dataMember

      const param = req.url.match(/^\/(\d+)$/)
      if (param) {
        data = dataMember.find(x => x.id == param[1])
        return res.end(JSON.stringify(data))
      }

      const perPage = 5;
      const totalPages = Math.ceil(dataMember.length / perPage)
      if (!req.params.page || req.params.page < 2) {
        data = data.slice(0, perPage)
      }
      else if (req.params.page >= totalPages) {
        data = data.slice((totalPages - 1) * perPage)
      }
      else {
        const offset = (req.params.page - 1) * perPage
        data = data.slice(offset, offset + perPage)
      }

      res.setHeader('X-Pagination-Per-Page', perPage)
      res.setHeader('X-Pagination-Total-Count', dataMember.length)
      res.end(JSON.stringify(data))
    },

    POST(req, res) {
      let hasError;
      let errors = {};
      let fields = {name: 'Name', email: 'Email', phone: 'Phone', dateOfBirth: 'Birth Date'};

      for (let field in fields) {
        if (!req.body[field]) {
          errors[field] = `${fields[field]} cannot be empty`;
          hasError = true;
        }
      }

      if (hasError) {
        return res.validationError(JSON.stringify(errors))
      }

      req.body.id = 1 + dataMember.length;
      dataMember.push(req.body)

      res.statusCode = 201
      res.end(JSON.stringify(req.body))
    },

    PATCH(req, res) {
      const model = dataMember.find(x => x.id == req.url.slice(1))

      if (!model) return res.notFound(`Data tidak ada`)

      delete req.body.id;

      for (prop in req.body) {
        if (req.body.hasOwnProperty(prop)) {
          model[prop] = req.body[prop];
        }
      }

      res.end()
    },

    DELETE(req, res) {
      for (let i=0; i<dataMember.length; i++) {
        if (dataMember[i].id == req.url.slice(1)) {
          dataMember.splice(i, 1)
        }
      }

      res.statusCode = 204;
      res.end()
    }
  },


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
      res.statusCode = 204;
      res.setHeader('Set-Cookie', 'rt=; Max-Age=0')
      res.end()
    }
  },


  '': {
    GET(req, res) {
      if (req.uri === '/') {
        res.end(Object.entries(endpoints).reduce((prev, [uri]) => prev += '<a href=/api' + uri + '>' + uri + '</a><br>', ''))
      } else {
        res.statusCode = 404;
        res.end()
      }
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
        req.params = parseQs(req._parsedUrl.query)

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
