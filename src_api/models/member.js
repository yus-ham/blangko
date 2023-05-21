import activeRecord from '../lib/active-record.js';


export default {
    ...activeRecord({table: `member`}),

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
