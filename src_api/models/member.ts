// const { knex } = require('../lib/common');
import activeRecord from '../lib/active-record';


const table = 'member';

export default {
    ...activeRecord(table),

    preSave(data) {
        if (!data) {
            return;
        }

        const attrs = ['name', 'email', 'phone', 'dob'];

        for (let attr in data) {
            if (!attrs.includes(attr)) {
                delete data[attr]
            }
        }
    },
}
