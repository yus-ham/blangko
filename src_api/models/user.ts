import common from '../lib/common';


export default {
    findByUsername(uname) {
        return common.knex().raw(`select * from user join role on role_id=role.id where username=? limit 1`, [uname]).then(res => res[0])
    }
}
