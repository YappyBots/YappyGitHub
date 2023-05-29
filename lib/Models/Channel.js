const bookshelf = require('.');

require('./Guild');

const Channel = bookshelf.Model.extend(
  {
    tableName: 'channels',

    casts: {
      useEmbed: 'boolean',
      ignoreUnknown: 'boolean',

      eventsList: 'array',
      usersList: 'array',
      branchesList: 'array',
      reposList: 'array',
    },

    guild() {
      return this.belongsTo('Guild');
    },

    connections() {
      return this.hasMany('ChannelConnection');
    },

    getConnections() {
      return this.related('connections').pluck('githubName');
    },

    async addRepo(repo) {
      await this.related('repos').create({
        name: repo,
      });

      return this;
    },

    async addOrg(org) {
      await this.related('org').save({
        name: org,
      });

      return this;
    },
  },
  {
    validKeys: ['repo', 'useEmbed', 'ignoreUnknown'],

    create(channel) {
      if (!channel.guild) return Promise.resolve();

      Log.info(
        `DB | Channels + "${channel.guild.name}"'s #${channel.name} (${channel.id})`
      );

      return this.forge({
        id: channel.id,
        name: channel.name,

        guildId: channel.guild.id,
      }).save(null, {
        method: 'insert',
      });
    },

    /**
     * Delete channel
     * @param {external:Channel} channel
     * @param {boolean} [fail]
     */
    delete(channel, fail = true) {
      Log.info(
        `DB | Channels - "${channel.guild.name}"'s #${channel.name} (${channel.id})`
      );

      return this.forge({
        id: channel.id,
      }).destroy({
        require: fail,
      });
    },

    findByRepo(repo) {
      const r = repo.toLowerCase();

      return this.query((qb) =>
        qb
          .join('channel_repos', 'channel_repos.channel_id', 'channels.id')
          .where('channel_repos.name', 'LIKE', r)
      ).fetchAll();
    },

    findByOrg(org) {
      const r = org.toLowerCase();

      return this.query((qb) =>
        qb
          .join('channel_orgs', 'channel_orgs.id', 'channels.id')
          .where('channel_orgs.name', 'LIKE', r)
      ).fetchAll();
    },

    findByChannel(channel) {
      return this.forge()
        .where('id', channel.id || channel)
        .fetch();
    },

    addRepoToChannel(channel, repo) {
      return this.findByChannel(channel)
        .then((ch) => ch.addRepo(repo))
        .catch(Channel.NotFoundError, () => null);
    },
  }
);

module.exports = bookshelf.model('Channel', Channel);
