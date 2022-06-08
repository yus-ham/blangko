import cookie from 'cookie';


async function parse({request, next, data}) {
  data.cookies = await cookie.parse(request.headers.cookie||'') || {};
  return next()
}

export const onRequest = [parse]
