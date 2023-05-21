import common from '../lib/common.js';
import Bcrypt from 'bcryptjs';
import Jwt from 'jsonwebtoken';
import RefreshToken from './refresh-token.js';
import User from './user.js';


const config = {
    jwt_key: process.env.JWT_KEY
}

export default {
    async loginByToken(rt = null) {
        const result = await common.db().query(`
            select username,role.name as role from user
            join refresh_token on user.id=user_id
            join role on role.id=role_id
            where value=? limit 1`,
        [rt])

        if (result[0]) {
            return {
                token: Buffer.from(config.jwt_key + Date.now()).toString('base64'),
                identity: { username: result[0].username, role: result[0].role }
            }
        }
    },

    async loginByPassword(info) {
        const errors = { password: `Username or password invalid.` }
        const identity = await User.findByUsername(info.username)

        if (!identity) {
            return common.invalidValueError(errors)
        }

        const valid = Bcrypt.compareSync(info.password, '$2b'+ identity.password_hash.slice(3))
        if (!valid) {
            return common.invalidValueError(errors)
        }

        info.user_id = identity.id;
        identity.role = identity.name;
        delete identity.password_hash;

        return RefreshToken.getOrCreate(info)
            .then(rt => ({
                identity,
                token: Jwt.sign({ id: identity.id }, config.jwt_key),
                refresh_token: rt.value,
            }))
            .catch(err => common.invalidValueError(errors))
    }
}
