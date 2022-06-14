const { serveResource } = require('./app');


module.exports = function () {
  return {
    configureServer: function (vite) {
      vite.middlewares.use('/api', serveResource)
    }
  }
}
