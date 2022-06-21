// const parsers = {
//   'application/json': req => req.json(),
//   'multipart/form-data': req => req.formData(),
//   'application/x-www-form-urlencoded': parseQs,
// }

// function parseQs(req) {
//   return req.text().then(qs => {
//     qs = [...new URLSearchParams(qs)]
//     return qs.reduce((data, pair) => (data[pair[0]] = pair[1], data), {})
//   })
// }

// function parseCookies(req) {
//   let cookies = String(req.headers.get('cookie')||'').split('; ')
//   let result = {};

//   for (let cookie of cookies) {
//     let [key, value] = cookie.split('=')
//     if (!result[key]) {
//       result[key] = value;
//     }
//   }

//   return result;
// }


// import { readFileSync } from 'fs';
// const root = __dirname + '/../dist';

// function createContext(req, res) {
//   return {
//     request: {
//       headers: {
//         get(key) {
//           return req.headers[key]
//         }
//       }
//     },
//     params: {...parseQs(req._parsedUrl.query), route: req._parsedUrl.pathname.split('/').slice(2)}
//   }
// }

import serveResource from '../../src_api/app';

export const onRequest = [
  async function serve({request, next, data, params}) {
    const headers = {};
    const res = {
      end(data) {
        this._data = data
      },
      setHeader(key, value) {
        headers[key] = value;
      }
    }
    serveResource({...request, parsedUrl: new URL(request.url)}, res)

    data = JSON.parse(data)
    data.respon = {headers, res}
    data = JSON.stringify(data)

    return new Response(data, {
      status: res.statusCode,
      headers,
    })

  }

  // V1
  // async function parse({request, next, data, params}) {
  //   // const url = new URL(request.url)
  //   // if (url.pathname.slice(0, 4) !== '/api') {

  //   //   return new Response('', {status: 200})
  //   // }

  //   data.cookies = parseCookies(request)

  //   const type = request.headers.get('content-type')
  //   if (type && parsers[type]) {
  //     data.body = await parsers[type](request)
  //   }

  //   // return next()
  // }
]
