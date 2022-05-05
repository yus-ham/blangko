const {phpcgi} = require('../config.env.json');

let vite;

module.exports = function () {
  return {
    configureServer(_vite) {
      vite = _vite

      vite.middlewares.use('/api', async(req, res, next) => {
        req.cookies = {};
        String(req.headers.cookie).split('; ').forEach(x => {
          x = x.split('=');
          if (!req.cookies[x[0]]) {
            req.cookies[x[0]] = x[1];
          }
        })
        next()
      })

      phpcgi && vite.middlewares.use(API_URL, require('node-phpcgi')(phpcgi));
    }
  }
}
