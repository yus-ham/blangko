import cookie from 'cookie';


async function parse({request}) {
  request.cookies = cookie.parse(request.headers.cookie||'') || {};
  return await next()
}

export const onRequest = [parse]
