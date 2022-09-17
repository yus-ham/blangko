import { serveResource } from './app.js';


export default function () {
  return {
    configureServer: function (vite) {
      vite.middlewares.use('/api', serveResource)
    }
  }
}
