exports.up = async (knex) => {
  await knex.schema.table('channel_orgs', (t) =>
    t.renameColumn('id', 'channel_id')
  );
  await knex.schema.table('channel_orgs', (t) => {
    t.dropPrimary();
    t.integer('id').unsigned();
  });
  await knex.schema.table('channel_orgs', (t) =>
    t.increments('id').primary().alter()
  );
};

exports.down = async (knex) => {
  await knex.schema.table('channel_orgs', (t) => {
    t.dropPrimary();
    t.dropColumn('id');
  });
  await knex.schema.table('channel_orgs', (t) =>
    t.renameColumn('channel_id', 'id')
  );
  await knex.schema.table('channel_orgs', (t) => t.primary('id'));
};
