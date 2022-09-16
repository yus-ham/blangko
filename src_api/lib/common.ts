import cfg from '../../config.ts';
import knex from './knex.ts';


let _knex;

export default {
    knex() {
        if (!_knex) {
            _knex = knex({ connection: cfg.db, client: cfg.db.client })
        }
        return _knex;
    },

    invalidValueError(detail) {
        throw { detail, status: 422, statusText: 'Data Validation Failed.' }
    },

    createPager(ctx, total, limit = 10) {
        ctx.res.headers.set('X-Pagination-Total-Count', total)
        ctx.res.headers.set('X-Pagination-Per-Page', limit)

        const page = +ctx.req.params.page || 1;
        const offset = (page - 1) * limit;

        return { total, limit, offset }
    },
}
