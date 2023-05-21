import db from './db.js';


let _db;

export default {
    db: () => _db || (_db = db()),

    invalidValueError(detail) {
        throw { detail, status: 422, statusText: 'Data Validation Failed.' }
    },

    createPager(ctx, total, limit = 10) {
        ctx.res.beforeSend.push(_ => {
            ctx.res.headers.set('X-Pagination-Total-Count', total)
            ctx.res.headers.set('X-Pagination-Per-Page', limit)
        })

        const page = +ctx.req.params.page || 1;
        const offset = (page - 1) * limit;

        return { total, limit, offset }
    },
}
