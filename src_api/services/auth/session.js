import Session from '../../models/session.js';


export default {

    async onRequestGet(req, res) {
        const session = await Session.loginByToken(req.cookies.rt)
        if (!session) {
            req.clientID || req.generateCID()
            return res.status(401)
        }
        return session
    },

    async onRequestPost(req, res) {
        const info = new Proxy({client_id: req.clientID}, {
            get: (target, p) => target[p]||req.bodyParsed[p]
        })

        return Session.loginByPassword(info)
            .then(data => {
                res.cookie('rt', data.refresh_token)
                return data
            })
    },

    onRequestDelete(req, res) {
        res.cookie('rt', '')
    }
}
