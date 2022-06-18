const Model = require('../../models/member');


module.exports = {
  
  async get(id) {
    if (id) {
      const model = await Model.find().where('id', id).first()
      return model || this.httpError(404)
    }

    const {total} = await Model.find().count('id as total').first()
    let paging = this.createPager(total)

    return total ? Model.find().limit(paging.limit).offset(paging.offset) : [];
  },

  async post() {
    return Model.insert(this.body)
  },

  async patch(id) {
    let res = await Model.update(id, this.body)
    return res || this.httpError(404)
  },

  async delete(id) {
    return Model.delete(id)
  }
}
