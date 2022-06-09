const identity = {
  username: 'admin',
  password: 123456789,
  role: 'Administrator',
}


export async function onRequestGet({data}) {
  let status = 200;

  if (data.cookies.rt) {
    data.token = btoa(Date.now())
    data.identity = identity;
  } else {
    status = 401;
  }

  return new Response(JSON.stringify(data), {status})
}

export async function onRequestPost({request}) {
  const body = {
    // u: await request.formUrl(),
    // d: await request.formData(),
    t: await request.formUrl()
  }

  if (body.username !== identity.username || body.password != identity.password) {
    return new Response(JSON.stringify(body), {status: 422})
    return new Response('{"password":"Invalid username or password"}', {status: 422})
  }

  const refresh_token = btoa(String(Date.now()).split('').reverse().join())

  const data = JSON.stringify({
      token: btoa(Date.now()),
      refresh_token,
      identity,
  })

  return new Response(data, {
    headers: {'Set-Cookie': 'rt='+ refresh_token},
    status: 201,
  })
}

export async function onRequestPatch(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  return new Response("Hello, world!");
}

export async function onRequestDelete(context) {
  // Contents of context object
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  return new Response("Hello, world!");
}
