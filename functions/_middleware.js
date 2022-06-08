import cookie from 'cookie';


async function parse({request}) {
  request.cookies = cookie.parse(request.headers.cookie||'') || {};
}

export const onRequest = [parse]
