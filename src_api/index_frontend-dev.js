let dataMember = require('./data_frontend-dev.json')

const cookie = {}

const identity = {
  username: 'admin',
  password: 123456789,
  role: 'Administrator',
}


const endpoints = {
  '/crud/member': {
    getId(req) {
      return req._parsedUrl.pathname.slice('/api/crud/member/'.length)
    },

    GET(req, res) {
      let data = dataMember;

      const id = this.getId(req)
      if (id) {
        data = dataMember.find(x => x.id == id)

        if (!data) {
          res.statusCode = 404;
        }

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
      let fields = {name: 'Name', email: 'Email', phone: 'Phone', dob: 'Birth Date'};

      for (let field in fields) {
        if (!req.body[field]) {
          errors[field] = `${fields[field]} cannot be empty`;
          hasError = true;
        }
      }

      if (hasError) {
        res.statusCode = 422;
        return res.end(JSON.stringify(errors))
      }

      req.body.id = 1 + dataMember.length;
      dataMember.push(req.body)

      res.statusCode = 201
      res.end(JSON.stringify(req.body))
    },

    updateModel(i, req) {
      for (prop in req.body) {
        if (req.body.hasOwnProperty(prop)) {
          dataMember[i][prop] = req.body[prop];
        }
      }
      return dataMember[i]
    },

    PATCH(req, res) {
      const id = this.getId(req)

      for (let i=0; i<dataMember.length; i++) {
        if (dataMember[i].id == id) {
          return res.end(JSON.stringify(this.updateModel(i, req)))
        }
      }

      res.statusCode = 404;
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
      if (cookie.rt) {
        res.end(JSON.stringify({token: btoa(Date.now()), identity}))
      } else {
        res.statusCode = 401;
        res.end()
      }
    },

    POST(req, res) {
      if (req.body.username !== identity.username || req.body.password != identity.password) {
        res.statusCode = 422;
        return res.end('{"password":"Invalid username or password"}')
      }

      const refresh_token = btoa(String(Date.now()).split('').reverse().join())
      res.setHeader('Set-Cookie', 'rt='+ refresh_token)
      res.statusCode = 201;

      return res.end(JSON.stringify({
        token: btoa(Date.now()),
        refresh_token,
        identity
      }))
    },

    DELETE(req, res) {
      res.statusCode = 204;
      res.setHeader('Set-Cookie', 'rt=; Max-Age=0')
      res.end()
      delete cookie.rt
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
  'application/x-www-form-urlencoded': parseQs
}

module.exports = function () {
  return {
    configureServer: function (vite) {
      vite.middlewares.use('/api', async(req, res, next) => {
        req.params = parseQs(req._parsedUrl.query)

        if (req.method !== 'GET') {
          const text = (await require('raw-body')(req)).toString()
          req.body = text ? parsers[req.headers['content-type']](text) : null
        }

        String(req.headers.cookie).split('; ').forEach(x => {
          x = x.split('=');
          if (!cookie[x[0]]) {
            cookie[x[0]] = x[1];
          }
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
