import cookie from 'cookie';


const parsers = {
  'application/json': req => req.json(),
  'multipart/form-data': req => req.formData(),
  'application/x-www-form-urlencoded': parseQs,
}

function parseQs(req) {
  return req.text().then(qs => {
    qs = [...new URLSearchParams(qs)]
    return qs.reduce((data, pair) => (data[pair[0]] = pair[1], data), {})
  })
}

export const onRequest = [
  async function parse({request, next, data}) {
    data.cookies = await cookie.parse(request.headers.get('cookie')||'') || {};

    const type = request.headers.get('content-type')
    if (type && parsers[type]) {
      data.body = await parsers[type](request)
    }

    return next()
  }
]
