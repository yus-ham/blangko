const table = 'user';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable(table, function(table) {
    table.increments();
    table.integer('role_id').notNullable();
    table.string('username', 20).notNullable();
    table.string('email', 30).notNullable();
    table.string('password_hash', 60).notNullable();
    table.integer('deleted_at');
    table.integer('created_at');
    table.integer('updated_at');
    table.integer('created_by');
    table.integer('updated_by');
  })

  await knex(table).insert({id: 1, role_id: 1, username: 'admin', email: 'admin@example.com', password_hash: '$2b$10$NSV6c/D123eMGdjgYK.sRewGWHzS3rFCcjHDrHrQs2Imea7lgUFCi'})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable(table);
};
