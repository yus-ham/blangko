const identity = {
  username: 'admin',
  password: 123456789,
  role: 'Administrator',
}


export async function onRequestGet({data}) {
  let status = 200;

  if (data.cookies.rt) {
    data = {identity, token: btoa(Date.now())}
  } else {
    status = 401;
  }

  return new Response(JSON.stringify(data), {status})
}

export async function onRequestPost({data}) {
  if (data.body.username !== identity.username || data.body.password != identity.password) {
    return new Response('{"password":"Invalid username or password"}', {status: 422})
  }

  const refresh_token = btoa(String(Date.now()).split('').reverse().join())

  data = JSON.stringify({
      token: btoa(Date.now()),
      refresh_token,
      identity,
  })

  return new Response(data, {
    headers: {'Set-Cookie': 'rt='+ refresh_token},
    status: 201,
  })
}

export async function onRequestDelete() {
  return new Response(null, {
    headers: {'Set-Cookie':'rt=; Max-Age=0'},
    status: 204,
  });
}
