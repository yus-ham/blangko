import common from '../../lib/common.js';
import Model from '../../models/member.js';


export default {

    async onRequestGet(req, res) {
        if (req.params.get('id')) {
            return await Model.findOne(req.params.get('id')) || res.status(404)
        }

        const total = await Model.findTotalCount()
        if (!total) {
            return []
        }

        const paging = common.createPager({req, res}, total)
        return Model.findAll(paging.limit, paging.offset, [...req.params.entries()].filter(([key]) => ['name','email','phone'].includes(key)))
    },

    async onRequestPost(req) {
        return Model.insert(req.bodyParsed)
    },

    async onRequestPatch(req, res) {
        return await Model.update(req.params.get('id'), req.bodyParsed) || res.status(404)
    },

    async onRequestDelete(req) {
        return Model.delete(req.params.get('id'))
    }
}
