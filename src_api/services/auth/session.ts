import Session from '../../models/session';


export default {

    async onRequestGet({req, httpError}) {
        const session = await Session.loginByToken(req.cookies.rt)
        if (!session) {
            httpError(401)
        }
        return session
    },

    onRequestPost({req}) {
        req.body.user_ip = this.req.connection.remoteAddress;
        return Session.loginByPassword(this.body)
            .then(res => {
                this.setCookie('rt', res.refresh_token)
                return res;
            })
    },

    onRequestDelete() {
        this.setCookie('rt', '')
    }
}
