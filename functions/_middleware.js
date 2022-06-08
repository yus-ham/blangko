import cookie from 'cookie';


async function parse({request, next}) {
  request.cookies = await cookie.parse(request.headers.cookie||'') || {};
  return next()
}

export const onRequest = [parse]
