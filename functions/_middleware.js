import cookie from 'cookie';

export const onRequest = [
  async function parse({request, next, data}) {
    data.cookies = await cookie.parse(request.headers.cookie||'') || {};

    request.formUrl = function() {
      return request.text(qs => {
        qs = [...new URLSearchParams(qs)]
        return qs.reduce((data, pair) => (data[pair[0]] = pair[1], data), {})
      })
    }

    return next()
  }
]
