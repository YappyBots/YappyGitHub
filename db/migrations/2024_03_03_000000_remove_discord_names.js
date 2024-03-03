exports.up = async (knex) =>
  knex.transaction(async (trx) => {
    await trx.raw('ALTER TABLE channels DROP COLUMN name');
    await trx.raw('ALTER TABLE guilds DROP COLUMN name');
  });

exports.down = async (knex) => {
  await knex.schema.table('channels', (table) => table.string('name'));
  await knex.schema.table('guilds', (table) => table.string('name'));
};
