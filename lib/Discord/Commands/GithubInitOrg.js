const Command = require('../Command');
const Channel = require('../../Models/Channel');
const Github = require('../../Github');

class GithubInitOrgCommand extends Command {
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
      embed: {
        color: 0xfb9738,
        title: `\`${orgName}\`: ⚙ Working...`,
      },
    });

    return Github.getOrg(orgName)
      .then(async data => {
        const conf = await Channel.find(channelid, ['org']);

        if (data.login.toLowerCase() === conf.getOrg()) return;

        await conf.addOrg(data.login.toLowerCase());
      })
      .then(() => {
        const embed = this._successMessage(orgName);

        return workingMsg.edit({
          embed,
        });
      })
      .catch(err => {
        let errorMessage = err && err.message ? err.message : err || null;
        if (errorMessage && errorMessage !== 'Not Found')
          return this.commandError(
            msg,
            `Unable to get organization info for \`${orgName}\`\n${err}`
          );
        return this.commandError(
          msg,
          `Unable to initialize! The organization \`${orgName}\` doesn't exist!`
        );
      });
  }

  _successMessage(org) {
    return {
      color: 0x84f139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${org}\`: Successfully initialized organization events`,
      description: 'The repositories and/or organization must have a webhook pointing to <https://www.yappybots.tk/github>',
    };
  }
}

module.exports = GithubInitOrgCommand;
