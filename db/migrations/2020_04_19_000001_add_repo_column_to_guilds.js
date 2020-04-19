exports.up = (knex) =>
  knex.schema.table('guilds', (t) => {
    t.string('repo').nullable();
  });

exports.down = (knex) =>
  knex.schema.table('guilds', (t) => {
    t.dropColumn('repo');
  });
