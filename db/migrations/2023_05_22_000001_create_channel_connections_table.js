exports.up = (knex) =>
  knex.schema.createTable('channel_connections', (t) => {
    t.increments('id');

    t.string('channel_id');
    t.enum('type', ['repo', 'install']);
    t.string('github_name');
    t.integer('github_id').unsigned();

    t.foreign('channel_id').references('channels.id').onDelete('cascade');
    t.unique(['channel_id', 'type', 'github_id']);
  });

exports.down = (knex) => knex.schema.dropTable('channel_connections');
