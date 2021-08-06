const Command = require('../Command');
const Channel = require('../../Models/Channel');
const GitHub = require('../../GitHub');

class GitHubInitOrgCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'initorg',
      summary:
        'Initialize all repo events from an organization on the channel.',
      usage: 'initorg <repo>',
      examples: ['initorg YappyBots', 'initorg Discord'],
    };

    this.setConf({
      permLevel: 1,
      aliases: ['initializeorg'],
    });
  }

  async run(msg, args) {
    const channelid = msg.channel.id;
    const org = args[0];
    const organization = /^(?:https?:\/\/)?(?:github.com\/)?(.+)$/.exec(org);

    if (!organization || !organization[0]) return this.errorUsage(msg);

    const orgName = organization[0];

    const workingMsg = await msg.channel.send({
      embeds: [
        {
          color: 0xfb9738,
          title: `\`${orgName}\`: ⚙ Working...`,
        },
      ],
    });

    const conf = await Channel.findOrCreate(msg.channel, ['org']);

    let orgData;

    try {
      orgData = await GitHub.getOrg(orgName);
    } catch (err) {
      const errorMessage = err && err.message ? err.message : err || null;

      if (errorMessage && errorMessage !== 'Not Found')
        return this.commandError(
          msg,
          `Unable to get organization info for \`${orgName}\`\n${err}`
        );

      return this.commandError(
        msg,
        `Unable to initialize! The organization \`${orgName}\` doesn't exist!`
      );
    }

    const login = (orgData.login && orgData.login.toLowerCase()) || orgName;

    if (login === conf.getOrg()) return;

    await conf.addOrg(login);

    return workingMsg.edit({
      embed: this._successMessage(orgName),
    });
  }

  _successMessage(org) {
    return {
      color: 0x84f139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${org}\`: Successfully initialized organization events`,
      description:
        'The repositories and/or organization must have a webhook pointing to <https://www.yappybots.tk/github>',
    };
  }
}

module.exports = GitHubInitOrgCommand;
