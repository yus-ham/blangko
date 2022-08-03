// const { knex } = require('../lib/common');


export default function (table) {
    return {
        find: _ => knex().from(table),

        insert(data) {
            let ar = this;
            ar.preSave(data)
            return knex()(table).insert(data).into(table).then(res => ar.postSave(res, data))
        },

        postSave: (res, data) => {
            data.id = res[0];
            return data;
        },

        update(id, data) {
            this.preSave(data)
            return knex()(table).update(data).where(typeof id !== 'object' ? { id } : id)
        },

        delete: id => knex()(table).where(typeof id !== 'object' ? { id } : id).del(),
    }
}
