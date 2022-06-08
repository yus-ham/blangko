import cookie from 'cookie';


async function parse({request, next}) {
  request.cookies = cookie.parse(request.headers.cookie||'') || {};
  return await next()
}

export const onRequest = [parse]
