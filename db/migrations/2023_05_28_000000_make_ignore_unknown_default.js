// Too many unknown events now, the default should be to ignore them
exports.up = async (knex) =>
  knex.schema
    .table('channels', (t) => {
      t.boolean('ignore_unknown').defaultTo(true).alter();
    })
    .then(() => knex('channels').update('ignore_unknown', true));

// This doesn't rollback the values because it's not possible to know what they were before
exports.down = async (knex) =>
  knex.schema.table('channels', (t) => {
    t.boolean('ignore_unknown').defaultTo(false).alter();
  });
