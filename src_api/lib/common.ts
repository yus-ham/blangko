import cfg from '../../config.ts';
import db from './db.ts';


let _db;

export default {
    db() {
        if (!_db) {
            _db = knex({ connection: cfg.db, client: cfg.db.client })
        }
        return _db;
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
