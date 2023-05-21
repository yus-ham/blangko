const table = 'member';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable(table, function(table) {
    table.increments();
    table.string('name', 20).notNullable();
    table.string('email', 30).notNullable();
    table.string('phone', 20).notNullable();
    table.date('dob');
  })

  // Deletes ALL existing entries
  // await knex(table).del()
  await knex(table).insert([
    {id: 1, name: 'member 1 ', email: 'email 1', dob: '2020-01-01', phone: '078667212'},
    {id: 2, name: 'member 2 ', email: 'email 2', dob: '2020-01-01', phone: '078667212'},
  ]);
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable(table);
};
