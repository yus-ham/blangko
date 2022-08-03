const table = 'refresh_token';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable(table, function(table) {
    table.string('value', 60).notNullable().primary();
    table.integer('user_id').notNullable();
    table.string('user_ip', 20).notNullable();
    table.integer('expired_at');
    table.unique(['user_id','user_ip']);
  })

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable(table);
};
