import common from './common.js';


export default function (_ = {}) {
    if (!_.pk) {
        _.pk = `id`;
    }
    return {
        findOne(id) {
            return common.db().query(`select * from ${_.table} where ${_.pk} = ? limit 1`, [id]).then(r => r[0])
        },

        findAll(limit = ``, offset) {
            if (limit !== ``) {
                limit = `limit ${limit}`;
                if (offset) {
                    limit += ` offset ${offset}`;
                }
            }
            return common.db().query(`select * from ${_.table} ${limit}`)
        },

        findTotalCount() {
            return common.db().query(`select count(1) as total from ${_.table}`).then(r => r[0]?.total || 0)
        },

        async insert(data) {
            this.preSave(data)
            const keys = [], values = [], args = []
            for (let k in data) {
                keys.push(k)
                values.push(`?`)
                args.push(data[k])
            }
            await common.db().execute(`insert into ${_.table} (${keys.join(', ')}) values(${values.join(',')})`, args)
            const res = await common.db().query(`SELECT last_insert_id() as _id`)
            return this.postSave(res[0]._id, data)
        },

        postSave: (id, data) => {
            data.id = id
            return data
        },

        update(id, data) {
            this.preSave(data)
            const set = [], args = []
            for (let k in data) {
                set.push(`${k}=?`)
                args.push(data[k])
            }
            args.push(id)
            return common.db().execute(`update ${_.table} set ${set.join(', ')} where ${_.pk} = ?`, args)
        },

        delete: id => common.db().execute(`delete from ${_.table} where ${_.pk} = ?`, [id]),
    }
}
