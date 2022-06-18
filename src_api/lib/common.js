const { db } = require('../../config');
const cookie = require('cookie');


let _knex;

module.exports = {
  knex() {
    if (!_knex) {
      _knex = require('knex')({connection: db, client: db.client})
    }
    return _knex;
  },

  httpError(code) {
    throw {code}
  },

  invalid(errors) {
    errors.preResponse = res => {
      res.statusCode = 422;
      res.statusMessage = 'Data Validation Failed.';
    }
    return errors;
  },

  setCookie(key, value, opts = {}) {
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
