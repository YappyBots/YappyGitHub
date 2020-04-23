exports.up = (knex) =>
  knex.schema.table('channels', (t) => {
    t.boolean('ignore_unknown').defaultTo(false);
  });

exports.down = (knex) =>
  knex.schema.table('channels', (t) => {
    t.dropColumn('ignore_unknown');
  });
