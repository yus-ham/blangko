// const { knex } = require('../lib/common')


export default {
    findByUsername(uname) {
        return knex().from('user').join('role').where('username', uname).first()
    }
}
