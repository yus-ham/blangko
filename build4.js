module.exports = {
  deploy() {
    // copyConfig() {
        let fs = require('fs')
        if (!fs.existsSync('./config.js')) {
            let cfg = fs.readFileSync('./config.js-example', 'utf8')
            fs.writeFileSync('./config.js', cfg, {encoding: 'utf8'})
        }
  }
}
