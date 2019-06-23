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
  const guildsToMigrate = (await serverConfig.find({})).filter(
    g => g && g.guildID && !guilds.get(g.guildID)
  );

  console.log(`DB |> Guilds |> Migrating (${guildsToMigrate.length})`);

  const queue = new PQueue({
    concurrency: 5,
  });

  if (guildsToMigrate.length) process.stdout.write('DB |> Guilds |> ');

  await queue.addAll(
    guildsToMigrate.map(guild => async () =>
      (await Guild.forge({
        id: guild.guildID,
        name: guild.guildName,
        prefix: guild.prefix,
      }).save(null, {
        method: 'insert',
      })) && process.stdout.write('.')
    )
  );

  if (guildsToMigrate.length) process.stdout.write('\n');

  // === CHANNELS ===

  console.log('DB |> Channels |> Retrieving');

  const channels = await Channel.fetchAll();
  const channelsToMigrate = (await channelConfig.find({})).filter(
    ch => ch && ch.channelID && !channels.get(ch.channelID)
  );

  console.log(`DB |> Channels |> Migrating (${channelsToMigrate.length})`);

  const qq = new PQueue({
    concurrency: 1,
  });

  if (channelsToMigrate.length) process.stdout.write('DB |> Channels |> ');

  await qq.addAll(
    channelsToMigrate.map((ch) => async () => {
      const channel = await Channel.forge({
        id: ch.channelID,
        name: ch.channelName,
        guild_id: ch.guildID,
        repo: ch.repo,
        use_embed: ch.embed,
        disabled_events: JSON.stringify(ch.disabledEvents || []),
        ignored_users: JSON.stringify(ch.ignoredUsers || []),
        ignored_branches: JSON.stringify(ch.ignoredBranches || []),
      }).save(null, {
        method: 'insert',
      });

      if (Array.isArray(ch.repos))
        await Promise.all(
          ch.repos.map(repo =>
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
