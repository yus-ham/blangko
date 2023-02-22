import { serveResource } from './app.ts';


export default function () {
  return {
    configureServer: function (vite) {
      vite.middlewares.use('/api', async (req, res, next) => {
        req.headers.get = (k) => req.headers[k]
        const response = await serveResource({req, parsedUrl: req._parsedUrl})
        res.statusCode = response.status||404
        return res.end(response.body.toString())
      })
    }
  }
}
