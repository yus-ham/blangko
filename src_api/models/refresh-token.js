import common from '../lib/common.js';
import Jwt from 'jsonwebtoken';


const table = 'refresh_token';

function isValid(token) {
    return token && (Date.now() / 1000) < token.expired_at;
}

async function insert(data) {
    const value = Jwt.sign(Date.now(), String(new Date())).slice(-50)
    const expired_at = Date.now()/1000 + (60 * 60 * 24);
    const res = common.db().execute(`insert into ${table} (user_id,client_id,value,expired_at) values(${data.user_id||0},'${data.client_id}','${value}',${expired_at})`)
    return res.then(r => ({...data, expired_at, value}))
}

export default {
    async getOrCreate({ user_id, client_id }) {
        const token = await common.db().query(`select * from ${table} where user_id=? and client_id=? limit 1`, [user_id, client_id]).then(r => r[0])
        return isValid(token) ? token : insert({ user_id, client_id })
    }
}
