exports.up = (knex) =>
  knex.schema.table('channels', (t) => {
    t.enum('events_type', ['whitelist', 'blacklist']).defaultTo('blacklist');
    t.renameColumn('disabled_events', 'events_list');

    t.enum('users_type', ['whitelist', 'blacklist']).defaultTo('blacklist');
    t.renameColumn('ignored_users', 'users_list');

    t.enum('branches_type', ['whitelist', 'blacklist']).defaultTo('blacklist');
    t.renameColumn('ignored_branches', 'branches_list');

    t.enum('repos_type', ['whitelist', 'blacklist']).defaultTo('blacklist');
    t.renameColumn('ignored_repos', 'repos_list');
  });

exports.down = (knex) =>
  knex.schema.table('channels', (t) => {
    t.dropColumn('events_type');
    t.renameColumn('events_list', 'disabled_events');

    t.dropColumn('users_type');
    t.renameColumn('users_list', 'ignored_users');

    t.dropColumn('branches_type');
    t.renameColumn('branches_list', 'ignored_branches');

    t.dropColumn('repos_type');
    t.renameColumn('repos_list', 'ignored_repos');
  });
