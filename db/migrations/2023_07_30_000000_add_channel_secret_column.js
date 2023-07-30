exports.up = (knex) =>
  knex.schema.table('channels', (t) => {
    t.string('secret').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('channels', (t) => {
    t.dropColumn('secret');
  });
