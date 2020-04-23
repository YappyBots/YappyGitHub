const bookshelf = require('.');

require('./Channel');

const Guild = bookshelf.Model.extend(
  {
    tableName: 'guilds',

    channels() {
      return this.belongsTo('Channel');
    },
  },
  {
    validKeys: ['prefix', 'repo'],

    create(guild) {
      Log.info(`DB | Guilds + '${guild.name}' (${guild.id})`);

      return this.forge({
        id: guild.id,
        name: guild.name,
      }).save(null, {
        method: 'insert',
      });
    },

    /**
     * Delete guild
     * @param {external:Guild} guild
     * @param {boolean} [fail]
     */
    delete(guild, fail = true) {
      Log.info(`DB | Guilds - '${guild.name}' (${guild.id})`);

      return this.forge({
        id: guild.id,
      }).destroy({
        require: fail,
      });
    },
  }
);

module.exports = bookshelf.model('Guild', Guild);
