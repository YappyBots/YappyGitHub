// Too many unknown events now, the default should be to ignore them
exports.up = async (knex) =>
  knex.transaction(async (trx) => {
    await trx.raw(
      'ALTER TABLE channels ADD COLUMN ignore_unknown_ DEFAULT true'
    );
    await trx.raw('ALTER TABLE channels DROP COLUMN ignore_unknown');
    await trx.raw(
      'ALTER TABLE channels RENAME COLUMN ignore_unknown_ TO ignore_unknown'
    );
  });

// This doesn't rollback the values because it's not possible to know what they were before
exports.down = async (knex) => {
  // This is a no-op
};
