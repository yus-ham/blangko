import Model from '../../models/member';


export default {

    async onRequestGet(id) {
        if (id) {
            const model = await Model.find().where('id', id).first()
            return model || this.httpError(404)
        }

        const { total } = await Model.find().count('id as total').first()
        let paging = this.createPager(total)

        return total ? Model.find().limit(paging.limit).offset(paging.offset) : [];
    },

    async onRequestPost() {
        return Model.insert(this.body)
    },

    async onRequestPatch(id) {
        let res = await Model.update(id, this.body)
        return res || this.httpError(404)
    },

    async onRequestDelete(id) {
        return Model.delete(id)
    }
}
