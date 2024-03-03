exports.up = async (knex) =>
  knex.transaction(
    async (trx) => await trx.raw('ALTER TABLE guilds DROP COLUMN prefix')
  );

exports.down = async (knex) => {
  // No-op
};
