import { Database } from 'bun:sqlite';
// import knex from 'knex'; 

export default function({connection, client}) {
    if (client !== 'sqlite3') {
        // return knex({connection, client})
        return
    }

    const db = new Database(connection.filename);

    db.raw = function(sql, values=[]) {
        const stmt = db.query(sql)
        return Promise.resolve(stmt.all.apply(stmt, values))
    }

    return db;
}
