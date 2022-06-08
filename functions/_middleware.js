import cookie from 'cookie';


async function parse({request}) {
  request.cookies = cookie.parse(request.headers.cookie||'') || {};
  next()
}

export const onRequest = [parse]
