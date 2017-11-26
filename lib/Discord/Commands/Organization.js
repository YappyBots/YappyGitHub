const Command = require('../Command');
const Github = require('../../Github');
const moment = require('moment');

class Organization extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'org',
      description: 'Get information about an organization',
      usage: 'org <query>',
      examples: [
        'org YappyBots',
        'org Github',
      ],
    };

    this.help.aliases = ['organization'];
  }

  run(msg, args) {
    const query = args.join(' ');

    if (!query) return this.errorUsage(msg);

    const embed = new this.embed();

    return Github.getOrg(query)
    .then(org => {
      embed
      .setTitle(org.name)
      .setURL(org.html_url)
      .setColor(0x84F139)
      .setDescription(`${org.description}\n`)
      .setThumbnail(org.avatar_url)
      .setTimestamp()
      .addField('Website', org.blog || 'None', true)
      .addField('Location', org.location || 'Unknown', true)
      .addField('Created At', moment(org.created_at).format('MMMM Do, YYYY. h:mm A'), true)
      .addField('Repos', org.public_repos, true);

      return Github.getOrgMembers(org.login);
    }).then(members => {
      embed.addField(
        'Members',
        members.length ? members.map(m => `• [${m.login}](${m.html_url})`).slice(0, 15).join('\n') : 'No public members found',
      );
      return msg.channel.send({ embed });
    });
  }
}

module.exports = Organization;
