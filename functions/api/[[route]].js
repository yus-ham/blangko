import dataMember from './data.json';


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
      let fields = { name: 'Name', email: 'Email', phone: 'Phone', dateOfBirth: 'Birth Date' };

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

      return { token: Buffer.from(''+ Date.now()).toString('base64'), identity }
    },

    POST() {
      if (this.body.username !== identity.username || this.body.password != identity.password) {
        throw error(422, { password: 'Invalid username or password' })
      }

      const refresh_token = Buffer.from(''+ Date.now()).toString('base64').split('').reverse().join('')
      this.res.setHeader('Set-Cookie', 'rt=' + refresh_token + '; HttpOnly')

      return { token: Buffer.from(''+ Date.now()).toString('base64'), refresh_token, identity };
    },

    DELETE() {
      this.res.setHeader('Set-Cookie', 'rt=; Max-Age=0; HttpOnly')
    }
  }
}

function error(code, detail) {
  return {code, detail};
}


export async function onRequest({ data, request, params, env }) {
  // data = {
  //   env,
  //   data,
  //   params,
  //   url: new URL(request.url),
  // }

  const route = `/${params.route[0]}/${params.route[1]}`;

  if (!services[route]) {
    return new Response('', {status: 404})
  }
  
  if (!services[route][request.method]) {
    return new Response('', {status: 405})
  }

  const headers = {};

  const service = {
    res: {
      setHeader(key, value) {
        headers[key] = value;
      }
    },
    cookies: data.cookies || {},
    body: data.body,
  }

  let result, status = 200;
  if (request.method === 'POST') status = 201;
  else if (request.method === 'DELETE') status = 204;

  try {
    result = await services[route][request.method].call(service, params.route[2])
  } catch (err) {
    status = err.code || 500;
    result = err.detail || err.message || err;
  }

  return new Response(result ? JSON.stringify(result) : '', {status, headers})
}
