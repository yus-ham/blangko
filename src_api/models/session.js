const { knex, invalid } = require('../lib/common');
const { jwtKey } = require('../../config');
const Bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const RefreshToken = require('./refresh-token');
const User = require('./user');


module.exports = {
  async loginByToken(rt = null) {
    const result = await knex()
        .from('user')
        .join('refresh_token', 'user.id', '=', 'user_id')
        .join('role', 'role.id', '=', 'role_id')
        .where('value', rt)
        .select('username', 'role.name as role')
        .first()

    if (result) {
      return {
        token: Buffer.from(jwtKey + Date.now()).toString('base64'),
        identity: {username:result.username, role:result.role}
      }
    }
  },

  async loginByPassword(info) {
    const errors = {password: `Username or password invalid.`}
    const identity = await User.findByUsername(info.username)
    if (!identity) {
      return invalid(errors);
    }

    const valid = Bcrypt.compareSync(info.password, '$2b$'+ identity.password_hash.slice(4))
    if (!valid) {
      return invalid(errors)
    }

    info.user_id = identity.id;
    identity.role = identity.name;
    delete identity.password_hash;

    return {
      identity,
      token: Jwt.sign({id: identity.id}, jwtKey),
      refresh_token: (await RefreshToken.getOrCreate(info)).value,
    }
  }
}
