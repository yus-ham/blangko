const { knex } = require('../lib/common');
const activeRecord = require('../lib/active-record');


const table = 'member';

module.exports = {
  ...activeRecord(table),

  preSave(data) {
    if (!data) {
      return;
    }

    const attrs = ['name','email','phone','dob'];

    for (let attr in data) {
      if (!attrs.includes(attr)) {
        delete data[attr]
      }
    }
  },
}
