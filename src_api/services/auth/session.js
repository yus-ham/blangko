const Session = require('../../models/session');


module.exports = {

  async get() {
    const session = await Session.loginByToken(this.cookies.rt)
    if (!session) {
      this.httpError(401)
    }
    return session
  },

  post() {
    this.body.user_ip = this.req.connection.remoteAddress;
    return Session.loginByPassword(this.body)
        .then(res => {
            this.setCookie('rt', res.refresh_token)
            return res;
        })
  },

  delete() {
    this.setCookie('rt', '')
  }
}
