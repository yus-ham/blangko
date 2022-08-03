import { Database } from 'bun:sqlite';
// import knex from 'knex'; 

export default function({connection, client}) {
    if (client !== 'sqlite3') {
        return knex({connection, client})
    }

    const db = new Database(connection.filename);

    db.raw = async function(sql: string, params?: string[]) {
        let stmt = db.query(sql)
        return Promise.resolve(stmt.run.apply(stmt, params))
    }

    return db;
}
