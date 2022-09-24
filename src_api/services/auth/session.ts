import Session from '../../models/session.ts';
import Bcrypt from 'bcryptjs';


export default {

    async onRequestGet(req, res) {
        const session = await Session.loginByToken(req.cookies.rt)
        if (!session) {
            if (!req.cookies.cid) {
                const cid = Buffer.from(Bcrypt.genSaltSync()).toString('base64').slice(0,20)
                res.cookie('cid', cid)
            }
            return res.status(401)
        }
        return session
    },

    onRequestPost(req, res) {
        req.body.client_id = req.cookies.cid
        return Session.loginByPassword(req.body)
            .then(data => {
                res.cookie('rt', data.refresh_token)
                return data
            })
    },

    onRequestDelete(req, res) {
        res.cookie('rt', '')
    }
}
