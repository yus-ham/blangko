import common from '../lib/common.js';


export default {
    findByUsername(uname) {
        return common.db().query(`select * from user join role on role_id=role.id where username=? limit 1`, [uname]).then(r => r[0])
    }
}
