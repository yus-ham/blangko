import cfg from '../../config.ts';
import knex from './knex.ts';


let _knex;

export default {
  knex() {
    if (!_knex) {
      _knex = knex({connection: cfg.db, client: cfg.db.client})
    }
    return _knex;
  },

  invalidValueError(detail) {
    throw {detail, status: 422, statusText: 'Data Validation Failed.'}
  }
}
