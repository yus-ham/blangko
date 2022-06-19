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

function parseCookies(req) {
  let cookies = String(req.headers.get('cookie')||'').split('; ')
  let result = {};

  for (let cookie of cookies) {
    let [key, value] = cookie.split('=')
    if (!result[key]) {
      result[key] = value;
    }
  }

  return result;
}

export const onRequest = [
  async function parse({request, next, data}) {
    data.cookies = parseCookies(request)

    const type = request.headers.get('content-type')
    if (type && parsers[type]) {
      data.body = await parsers[type](request)
    }

    return next()
  }
]
