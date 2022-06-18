const table = 'role';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable(table, function(table) {
    table.increments();
    table.string('name', 20).notNullable();
    table.string('description', 30);
    table.integer('deleted_at');
  })

  await knex(table).insert({id: 1, name: 'Administrator'});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable(table);
};
