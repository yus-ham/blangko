const dataMember = require('./data.json')

const identity = {
  username: 'admin',
  password: 123456789,
  role: 'Administrator',
}


const services = {
  '/crud/member': {
    GET(id) {
      let data = dataMember;

      if (id) {
        return data.find(x => x.id == id)
      }

      const perPage = 5;
      const totalPages = Math.ceil(dataMember.length / perPage)
      if (!this.params.page || this.params.page < 2) {
        data = data.slice(0, perPage)
      }
      else if (this.params.page >= totalPages) {
        data = data.slice((totalPages - 1) * perPage)
      }
      else {
        const offset = (this.params.page - 1) * perPage
        data = data.slice(offset, offset + perPage)
      }

      this.res.setHeader('X-Pagination-Per-Page', perPage)
      this.res.setHeader('X-Pagination-Total-Count', dataMember.length)

      return data;
    },

    POST() {
      let hasError;
      let errors = {};
      let fields = { name: 'Name', email: 'Email', phone: 'Phone', dob: 'Birth Date' };

      for (let field in fields) {
        if (!this.body[field]) {
          errors[field] = `${fields[field]} cannot be empty`;
          hasError = true;
        }
      }

      if (hasError) {
        throw error(422, errors);
      }

      this.body.id = 1 + dataMember.length;
      dataMember.push(this.body)

      return this.body;
    },

    PATCH(id) {
      const model = dataMember.find(x => x.id == id)

      if (!model) throw error(404);

      delete this.body.id;

      for (let prop in this.body) {
        if (model.hasOwnProperty(prop)) {
          model[prop] = this.body[prop];
        }
      }

      return model;
    },

    DELETE(id) {
      for (let i = 0; i < dataMember.length; i++) {
        if (dataMember[i].id == id) {
          dataMember.splice(i, 1)
        }
      }
    }
  },


  '/auth/session': {
    GET() {
      if (!this.cookies.rt) {
        throw error(401)
      }

      return { token: btoa(Date.now()), identity }
    },

    POST() {
      if (this.body.username !== identity.username || this.body.password != identity.password) {
        throw error(422, {password: 'Invalid username or password'})
      }

      const refresh_token = btoa(String(Date.now()).split('').reverse().join())
      this.res.setHeader('Set-Cookie', 'rt=' + refresh_token +'; HttpOnly')

      return {token: btoa(Date.now()), refresh_token, identity};
    },

    DELETE() {
      this.res.setHeader('Set-Cookie', 'rt=; Max-Age=0; HttpOnly')
    }
  }
}


module.exports.serveResource = serveResource;
async function serveResource(req, res, next) {
  let [_, route, _id] = req._parsedUrl.pathname.match(/^\/api(\/.+?)(\/\d*)?$/)

  if (!services[route]) {
    return send(res, 404)
  }

  if (!services[route][req.method]) {
    return send(res, 405)
  }

  let ctx = {req, res};

  try {
    let { args, resCode } = await getActionMeta(ctx, _id)
    res = await services[route][req.method].apply(ctx, args)
    send(ctx.res, resCode, res)
  } catch (e) {
    if (!e.code || e.code >= 500) {
      throw e;
    }
    send(ctx.res, e.code, e.detail)
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


function parseBody(ctx) {
  return new Promise((resolve) => {
    if (!['POST', 'PATCH'].includes(ctx.req.method)) {
      return resolve()
    }

    let body = '';
    ctx.req.on('data', chunk => {
      body += chunk.toString()
    })
    
    ctx.req.on('end', () => {
      ctx.body = body ? parsers[ctx.req.headers['content-type']](body) : null;
      resolve()
    })
  })
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

function getActionMeta(ctx, _id) {
  ctx.cookies = parseCookies(ctx.req);
  ctx.params = parseQs(ctx.req._parsedUrl.search.slice(1));

  const meta = { args: [], resCode: 200 };

  if (['GET', 'PATCH', 'DELETE'].includes(ctx.req.method)) {
    meta.args[0] = +(_id || '').slice(1)
  }

  if (ctx.req.method === 'DELETE') meta.resCode = 204;
  else if (ctx.req.method === 'POST') meta.resCode = 201;

  return parseBody(ctx).then(_ => meta)
}

function send(res, code = 500, data = '') {
  if (typeof data === 'object') {
    data = JSON.stringify(data)
  } else if (data) {
    data = String(data)
  }

  res.statusCode = code;
  res.end(data)
}

function error(code = 500, detail = '') {
  throw {code, detail};
}
