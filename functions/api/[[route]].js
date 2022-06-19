export async function onRequest({data,request,params,env}) {
  data = {
    env,
    data,
    params,
    url: new URL(request.url),
  }
  return new Response(JSON.stringify(data), {
    status: 200,
  })
}
