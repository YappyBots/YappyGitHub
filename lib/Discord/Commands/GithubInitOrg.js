const Command = require('../Command');
const ChannelConfig = require('../../Models/ChannelConfig');
const Github = require('../../Github');

class GithubInitOrgCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'initorg',
      summary: 'Initialize all repo events from an organization on the channel.',
      usage: 'initorg <repo>',
      examples: [
        'initorg YappyBots',
        'initorg Discord',
      ],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initializeorg'],
    });
  }

  async run(msg, args) {
    const channelid = msg.channel.id;
    const org = args[0];
    const organization = /^(?:https?:\/\/)?(?:github.com\/)?(\w+)$/.exec(org);

    if (!organization || !organization[0]) return this.errorUsage(msg);

    const orgName = organization[0];

    const workingMsg = await msg.channel.send({
      embed: {
        color: 0xFB9738,
        title: `\`${orgName}\`: ⚙ Working...`,
      },
    });

    return Github.getOrgRepos(orgName).then(data => {
      const conf = ChannelConfig.findByChannel(channelid);
      const repos = data.filter(e => !e.private && !conf.repos.includes(e.full_name.toLowerCase())).map(e => e.full_name);

      return Promise.all(repos.map(repo => ChannelConfig.addRepoToChannel(channelid, repo))).then(() => repos);
    })
    .then(repos => {
      const embed = this._successMessage(orgName, repos);
      return workingMsg.edit({ embed });
    })
    .catch(err => {
      let errorMessage = err && err.message ? err.message : err || null;
      // if (errorMessage) errorMessage = JSON.parse(err.message).message;
      if (errorMessage && errorMessage !== 'Not Found') return this.commandError(msg, `Unable to get organization info for \`${orgName}\`\n${err}`);
      return this.commandError(msg, `Unable to initialize! The organization \`${orgName}\` doesn't exist!`);
    });
  }

  _successMessage(org, repos) {
    return {
      color: 0x84F139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${org}\`: Successfully initialized all public repository events`,
      description: [
        'The repositories must all have a webhook pointing to <http://discordjsrewritetrello-datitisev.rhcloud.com/github>',
        'To use embeds to have a nicer Github log, say `G! conf set embed true` in this channel.',
        `Initialized repos: ${repos.map(e => `\`${e}\``).join(', ')}`,
      ].join('\n'),
    };
  }
}

module.exports = GithubInitOrgCommand;
