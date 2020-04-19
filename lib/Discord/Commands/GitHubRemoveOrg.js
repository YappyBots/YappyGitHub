const Command = require('../Command');
const ChannelOrg = require('../../Models/ChannelOrg');

class GitHubRemoveOrgCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'removeorg',
      summary: 'Remove the initialized organization on the channel.',
      usage: 'removeorg <repo>',
      examples: ['removeorg YappyBots', 'removeorg Discord'],
    };

    this.setConf({
      permLevel: 1,
    });
  }

  async run(msg) {
    const channelid = msg.channel.id;
    const conf = await ChannelOrg.find(channelid);

    if (!conf) {
      return this.commandError(
        msg,
        "This channel doesn't have any organization events!"
      );
    }

    const name = conf.get('name');

    const workingMsg = await msg.channel.send({
      embed: {
        color: 0xfb9738,
        title: `\`${name}\`: ⚙ Working...`,
      },
    });

    return conf
      .destroy()
      .then(() => {
        let embed = this._successMessage(name);
        return workingMsg.edit({
          embed,
        });
      })
      .catch((err) => {
        Log.error(err);
        return this.commandError(
          msg,
          `An error occurred while trying to remove organization events for **${name}** in this channel.\n\`${err}\``
        );
      });
  }

  _successMessage(org) {
    return {
      color: 0x84f139,
      footer: {
        text: this.bot.user.username,
      },
      title: `\`${org}\`: Successfully removed organization events`,
    };
  }
}

module.exports = GitHubRemoveOrgCommand;
