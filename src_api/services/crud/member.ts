import common from '../../lib/common.ts';
import Model from '../../models/member.ts';


export default {

    async onRequestGet(req, res) {
        if (req.params.get('id')) {
            return await Model.findOne(req.params.get('id')) || res.status(404)
        }

        const total = await Model.findTotalCount()
        let paging = common.createPager({req, res}, total)

        return total ? Model.findAll(paging.limit, paging.offset) : [];
    },

    async onRequestPost(req) {
        return Model.insert(req.body)
    },

    async onRequestPatch(req, res) {
        return await Model.update(req.params.get('id'), req.body) || res.status(404)
    },

    async onRequestDelete(req) {
        return Model.delete(req.params.get('id'))
    }
}
