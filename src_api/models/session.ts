import common from '../lib/common.ts';
import Bcrypt from 'bcryptjs';
import Jwt from 'jsonwebtoken';
import RefreshToken from './refresh-token.ts';
import User from './user.ts';


const config = {
    jwtKey: process.env.JWT_KEY
}

export default {
    async loginByToken(rt = null) {
        const result = await common.db().raw(`
            select username,role.name as role from user
            join refresh_token on user.id=user_id
            join role on role.id=role_id
            where value=? limit 1`,
        [rt])

        if (result[0]) {
            return {
                token: Buffer.from(config.jwtKey + Date.now()).toString('base64'),
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

        const valid = Bcrypt.compareSync(info.password, '$2b$'+ identity.password_hash.slice(4))
        if (!valid) {
            return common.invalidValueError(errors)
        }

        info.client_id = info.client_id
        info.user_id = identity.id;
        identity.role = identity.name;
        delete identity.password_hash;

        return RefreshToken.getOrCreate(info)
            .then(rt => ({
                identity,
                token: Jwt.sign({ id: identity.id }, config.jwtKey),
                refresh_token: rt.value,
            }))
            .catch(err => common.invalidValueError(errors))
    }
}
