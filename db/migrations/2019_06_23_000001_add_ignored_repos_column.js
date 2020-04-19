exports.up = (knex) =>
  knex.schema.table('channels', (t) => {
    t.json('ignored_repos').defaultTo([]);
  });

exports.down = (knex) =>
  knex.schema.table('channels', (t) => {
    t.dropColumn('ignored_repos');
  });
