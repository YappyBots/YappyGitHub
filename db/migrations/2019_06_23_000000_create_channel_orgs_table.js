exports.up = knex =>
  knex.schema.createTable('channel_orgs', t => {
    t.string('id').primary();

    t.string('name').index();

    t.foreign('id')
      .references('channels.id')
      .onDelete('cascade');
  });

exports.down = knex => knex.schema.dropTable('channel_orgs');
