const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Github = require('../../Github');
const GithubUrlParser = require('../../Github/GithubRepoParser');

class GithubInitCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'init',
      summary: 'Initialize repo events on the channel.',
      description:
        'Initialize repo events on the channel.\n= Insert "private" as 2nd argument if the repo is private',
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
    const isPrivate = args[1] && args[1].toLowerCase() === 'private';

    const repository = GithubUrlParser.Parse(repo) || {};

    const repoName = repository.name;
    const repoUser = repository.owner;
    if (!repository || !repoName || !repoUser) return this.errorUsage(msg);
    const repoFullName = repository.repo && repository.repo.toLowerCase();

    const workingMsg = await msg.channel.send({
      embed: {
        color: 0xfb9738,
        title: `\`${repo}\`: ⚙ Working...`,
      },
    });

    if (isPrivate) {
      // GithubCache.add(repository.repo);
      let conf = await Channel.find(channelid, ['repos']);
      let doc = conf && conf.getRepos().includes(repoFullName);
      if (doc)
        return this.commandError(
          msg,
          `Repository \`${repository.repo}\` is already initialized in this channel`
        );
      return conf.addRepo(repoFullName).then(() => {
        let embed = this._successMessage(repository.repo);
        return workingMsg.edit({ embed });
      });
    }

    return Github.getRepo(repoFullName)
      .then(async data => {
        const repoActualName = data.full_name;
        const conf = await Channel.find(channelid);
        const doc = conf && conf.getRepos().includes(repoActualName);
        if (doc)
          return this.commandError(
            msg,
            `Repository \`${repoActualName}\` is already initialized in this channel`
          );
        return conf.addRepo(repoFullName);
      })
      .then(() => {
        const embed = this._successMessage(repository.repo);
        return workingMsg.edit({ embed });
      })
      .catch(err => {
        let errorMessage = err && err.message ? err.message : err || null;
        // if (errorMessage) errorMessage = JSON.parse(err.message).message;
        if (errorMessage && errorMessage !== 'Not Found')
          return this.commandError(
            msg,
            `Unable to get repository info for \`${repo}\`\n${err}`
          );
        return this.commandError(
          msg,
          `Unable to initialize! The repository \`${repository.repo}\` doesn't exist or is private!`
        );
      });
  }

  _successMessage(repo) {
    return {
      color: 0x84f139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${repo}\`: Successfully initialized repository events`,
      description: 'The repository must a webhook pointing to <https://www.yappybots.tk/github>',
    };
  }
}

module.exports = GithubInitCommand;
