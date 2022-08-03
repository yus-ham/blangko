// const { knex } = require('../lib/common');
import Jwt from 'jsonwebtoken';


const table = 'refresh_token';

function isValid(token) {
    return token && (Date.now() / 1000) < token.expired_at;
}

function insert(data) {
    data.expired_at = (Date.now() / 1000) + 60 * 60 * 24;
    data.value = Jwt.sign(Date.now(), String(new Date())).slice(-50)
    return knex().insert(data).into(table).then(res => data)
}

export default {
    getOrCreate({ user_id, user_ip }) {
        return knex().from(table).where('user_id', user_id).first()
            .then(res => isValid(res) ? res : insert({ user_id, user_ip }))
    }
}
