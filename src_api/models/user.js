const { knex } = require('../lib/common')


module.exports = {
    findByUsername(uname) {
      return knex().from('user').join('role').where('username', uname).first()
    }
}
