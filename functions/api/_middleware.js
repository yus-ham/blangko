import { serveResource } from '../../src_api/app';

export const onRequest = [
  async function serve({request, next, data, params}) {
    const req = {
      _parsedUrl: new URL(request.url),
      method: request.method,
      headers: [...request.headers].reduce((prev, [key, value]) => (prev[key] = value, prev), {}),
      on(type, fn) {
        if (type === 'data') {
          request.text().then(data => {
            req._body = data
            fn(data)
          })
        }
        else if (type === 'end') {
          setTimeout(_ => {
            fn()
          }, 100)
        }
      }
    }

    const res = {
      end(data) {
        console.info('res', data)
        this.data = data;
      },
      headers: {},
      setHeader(key, value) {
        this.headers[key] = value;
      }
    }

    await serveResource(req, res)

    return new Response(res.data, {
      status: res.statusCode||500,
      headers: res.headers,
    })
  }
]
