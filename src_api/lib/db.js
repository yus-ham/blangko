import path from 'path';
// import { Database } from 'bun:sqlite';
import knex from 'knex'; 

const config = {
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
    client: process.env.DB_DRIVER,
    dev: process.env.BUN_ENV !== 'production',
}

export default function() {
    if (config.client !== 'sqlite3') {
        const db = knex(config)
        return {
            query: (sql, args) => db.raw(sql, args).then(r => r[0]),
            execute: (sql, args) => db.raw(sql, args),
        }
    }

    const db = new Database(path.join(__dirname, '/../../', process.env.DB_DATABASE));

    db.raw = function(sql, values=[]) {
        config.dev && console.info(`sql:\n`, values.length ? values.reduce((sql, v) => sql.replace('?', typeof v === 'string' ? `'${v.replace(/\'/g,"\\'")}'` : v), sql) : sql, `\nvalues:`, values)
        const stmt = db.query(sql)
        return Promise.resolve(stmt.all.apply(stmt, values))
    }

    return db;
}
