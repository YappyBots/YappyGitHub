const mongoose = require('mongoose');
const { default: PQueue } = require('p-queue');
const Guild = require('../lib/Models/Guild');
const Channel = require('../lib/Models/Channel');

require('dotenv').config();

const channelConfig = mongoose.model('ChannelConfig', {
  guildName: String,
  guildID: String,
  channelName: String,
  channelID: String,
  repo: String,
  repos: Array,
  embed: Boolean,
  disabledEvents: Array,
  ignoredUsers: Array,
  ignoredBranches: Array,
});

const serverConfig = mongoose.model('ServerConfig', {
  guildName: String,
  guildID: String,
  prefix: String,
});

process.on('unhandledRejection', console.error);

(async () => {
  console.log('DB |> Connecting');

  await mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
  });

  console.log('DB |> Connected');

  // === GUILDS ===

  console.log('DB |> Guilds |> Retrieving');

  const guilds = await Guild.fetchAll();
  const guildConfigs = (await serverConfig.find({}));
  const guildsToMigrate = [...new Set(
    guildConfigs.map(e => String(e.get('guildId'))).filter(
      (id) => !guilds.get(id)
    )
  )];

  console.log(`DB |> Guilds |> Migrating (${guildsToMigrate.length})`);

  const queue = new PQueue({
    concurrency: 5,
  });

  if (guildsToMigrate.length) process.stdout.write('DB |> Guilds |> ');

  await queue.addAll(
    guildsToMigrate.map((id) => async () => {
      const guild = guildConfigs.filter((e) => e.get('guildId') == id)[0];

      if (await Guild.find(id)) return process.stdout.write('!');

      await Guild.forge({
        id,
        prefix: guild.get('prefix'),
        repo: guild.get('repo'),
      }).save(null, {
        method: 'insert',
      });

      process.stdout.write('.');
    })
  );

  if (guildsToMigrate.length) process.stdout.write('\n');

  // === CHANNELS ===

  console.log('DB |> Channels |> Retrieving');

  const channels = await Channel.fetchAll();
  const channelConfigs = await channelConfig.find({});
  const channelsToMigrate = [
    ...new Set(
      channelConfigs
        .map((e) => String(e.get('channelId')))
        .filter((id) => !channels.get(id))
    ),
  ];

  console.log(`DB |> Channels |> Migrating (${channelsToMigrate.length})`);

  const qq = new PQueue({
    concurrency: 1,
  });

  if (channelsToMigrate.length) process.stdout.write('DB |> Channels |> ');

  await qq.addAll(
    channelsToMigrate.map((id) => async () => {
      const ch = channelConfigs.filter((e) => e.get('channelId') == id);
      const guildId = ch.map((e) => e.get('guildId')).filter(Boolean)[0];

      if (await Channel.find(id)) return process.stdout.write('!');

      const channel = await Channel.forge({
        id,
        guild_id: guildId,
      }).save(null, {
        method: 'insert',
      });

      const repos = ch.map((e) => e.get('repo')).flat();

      await Promise.all(
        repos.map((repo) =>
          channel.related('repos').create({
            name: repo,
          })
        )
      );

      process.stdout.write('.');
    })
  );

  if (channelsToMigrate.length) process.stdout.write('\n');

  process.exit(0);
})();
