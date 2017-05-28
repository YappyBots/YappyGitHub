const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const Github = require('../../Github');
const GithubUrlParser = require('../../Github/GithubRepoParser');

class GithubInitCommand extends Command {

  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'init',
      summary: 'Initialize repo events on the channel.',
      description: 'Initialize repo events on the channel.\n= Insert "private" as 2nd argument if the repo is private',
      usage: 'init <repo> [private]',
      examples: [
        'init datitisev/OhPlease-Yappy',
        'init https://github.com/datitisev/DiscordBot-Yappy',
        'init Private/Repo private',
      ],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initialize'],
    });
  }

  async run(msg, args) {
    const channelid = msg.channel.id;
    const repo = args[0];
    const isPrivate = args[1] && (args[1].toLowerCase() === 'private');

    const repository = GithubUrlParser.Parse(repo) || {};

    const repoName = repository.name;
    const repoUser = repository.owner;
    if (!repository || !repoName || !repoUser) return this.errorUsage(msg);
    const repoFullName = repository.repo && repository.repo.toLowerCase();

    const workingMsg = await msg.channel.send({
      embed: {
        color: 0xFB9738,
        title: `\`${repo}\`: ⚙ Working...`,
      },
    });

    if (isPrivate) {
      // GithubCache.add(repository.repo);
      let conf = ChannelConfig.findByChannel(channelid);
      let doc = conf && conf.repos ? conf.repos.includes(repoFullName) : false;
      if (doc) return this.commandError(msg, `Repository \`${repository.repo}\` is already initialized in this channel`);
      return ChannelConfig.addRepoToChannel(channelid, repoFullName)
      .then(() => {
        let embed = this._successMessage(repository.repo);
        return workingMsg.edit({ embed });
      });
    }

    return Github.getRepo(repoUser, repoName).then(res => {
      const repoInfo = res.body;
      const repoActualName = repoInfo.path_with_namespace;
      const conf = ChannelConfig.findByChannel(channelid);
      const doc = conf && conf.repos ? conf.repos.includes(repoActualName) : false;
      if (doc) return this.commandError(msg, `Repository \`${repoActualName}\` is already initialized in this channel`);
      return ChannelConfig.AddRepoToChannel(channelid, repoFullName)
      .then(() => {
        let embed = this._successMessage(repoActualName);
        return workingMsg.edit({ embed });
      });
    }).catch(err => {
      let errorMessage = err && err.message ? err.message : err || null;
      if (errorMessage) errorMessage = JSON.parse(err.message).message;
      if (errorMessage && errorMessage !== 'Not Found') return this.commandError(msg, `Unable to get repository info for \`${repo}\`\n${err}`);
      return this.commandError(msg, `Unable to initialize! The repository \`${repository.repo}\` doesn't exist or is private!`);
    });
  }

  _successMessage(repo) {
    return {
      color: 0x84F139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${repo}\`: Successfully initialized repository events`,
      description: [
        'The repository must a webhook pointing to <http://discordjsrewritetrello-datitisev.rhcloud.com/github>',
        'To use embeds to have a nicer Github log, say `G! conf set embed true` in this channel to enable embeds for the current channel.',
      ].join('\n'),
    };
  }

}

module.exports = GithubInitCommand;
