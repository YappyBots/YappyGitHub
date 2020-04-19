exports.up = (knex) => {
  return knex.schema
    .createTable('guilds', (t) => {
      t.string('id').primary();

      t.string('name').nullable();

      t.string('prefix').nullable();
    })

    .createTable('channels', (t) => {
      t.string('id').primary();

      t.string('name').nullable();
      t.string('guild_id').nullable();

      t.string('repo').nullable();

      t.boolean('use_embed').defaultTo(true);

      t.json('disabled_events').nullable();

      t.json('ignored_users').defaultTo([]);
      t.json('ignored_branches').defaultTo([]);

      t.foreign('guild_id').references('guilds.id').onDelete('cascade');
    });
};

exports.down = (knex) => {
  return knex.schema.dropTable('channels').dropTable('guilds');
};
