import common from '../lib/common';
import config from '../../config';
// import Bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';
import RefreshToken from './refresh-token';
import User from './user';


export default {
  async loginByToken(rt = null) {
    const result = await common.knex().raw(`
        select username,role.name as role from user
        join refresh_token on user.id=user_id
        join role on role.id=role_id
        where value=?
    `, [rt])

    console.info({result})

    if (result) {
      return {
        token: Buffer.from(config.jwtKey + Date.now()).toString('base64'),
        identity: {username:result.username, role:result.role}
      }
    }
  },

  async loginByPassword(info) {
    const errors = {password: `Username or password invalid.`}
    const identity = await User.findByUsername(info.username)
    if (!identity) {
      return common.invalid(errors);
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
