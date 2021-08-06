const { default: PQueue } = require('p-queue');
const Guild = require('./Guild');
const Channel = require('./Channel');

const loaded = { guilds: false, channels: false };
const createQueue = () =>
  new PQueue({
    concurrency: 5,
    autoStart: false,
  });

const addGuilds = async (bot) => {
  const queue = createQueue();
  const guilds = await Guild.fetchAll();

  queue.addAll(
    bot.guilds.cache
      .filter((g) => g && g.id && !guilds.get(g.id))
      .map((g) => () => Guild.create(g))
  );

  await queue.start();
};

const addChannels = async (bot) => {
  const queue = createQueue();
  const channels = await Channel.fetchAll();

  queue.addAll(
    bot.channels.cache
      .filter((ch) => ch && ch.id && !channels.get(ch.id))
      .map((ch) => () => Channel.create(ch))
  );

  await queue.start();
};

module.exports = async (bot) => {
  if (!loaded.guilds) {
    loaded.guilds = true;

    bot.on('guildDelete', async (guild) => {
      if (!guild || !guild.available) return;

      await Guild.delete(guild, false);
    });

    bot.on('guildCreate', async (guild) => {
      if (!guild || !guild.available) return;
      if (await Guild.find(guild.id)) return;

      await Guild.create(guild);
    });

    await addGuilds(bot);
  }

  if (!loaded.channels) {
    loaded.channels = true;

    bot.on('channelDelete', async (channel) => {
      if (!channel || channel.type !== 'text') return;

      await Channel.delete(channel, false);
    });

    bot.on('channelCreate', async (channel) => {
      if (!channel || channel.type !== 'text') return;
      if (await Channel.find(channel.id)) return;

      await Channel.create(channel);
    });

    await addChannels(bot);
  }
};
