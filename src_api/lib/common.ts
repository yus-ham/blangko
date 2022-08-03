import cfg from '../../config';
import knex from './knex';
import cookie from 'cookie';


let _knex;

export default {
  knex() {
    if (!_knex) {
      _knex = knex({connection: cfg.db, client: cfg.db.client})
    }
    return _knex;
  },

  httpError(code: Number) {
    throw {code}
  },

  invalid(errors) {
    errors.preResponse = res => {
      return new Response('', {status: 422, statusText: 'Data Validation Failed.'})
    }
    return errors;
  },

  setCookie(key: string, value: string, opts = {}) {
    if (!value) {
      this.res.setHeader('Set-Cookie', key + '=; MaxAge=0; HttpOnly')
    } else {
      opts.httpOnly = true;
      this.res.setHeader('Set-Cookie', cookie.serialize(key, value, opts))
    }
  },

  createPager(total, limit = 10) {
    this.res.setHeader('X-Pagination-Total-Count', total)
    this.res.setHeader('X-Pagination-Per-Page', limit)

    const page = +this.params.page||1;
    const offset = (page - 1) * limit;

    return {total, limit, offset}
  }
}
