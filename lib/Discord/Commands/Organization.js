const Command = require('../Command');
const GitHub = require('../../GitHub');
const moment = require('moment');

class Organization extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'org',
      description: 'Get information about an organization',
      usage: 'org <query>',
      examples: ['org YappyBots', 'org GitHub'],
    };

    this.help.aliases = ['organization'];
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addStringOption((option) =>
        option.setName('query').setDescription('The query').setRequired(true)
      );
  }

  async run(interaction) {
    const query = interaction.options.getString('query', true);

    await interaction.deferReply();

    const org = await GitHub.getOrg(query);

    if (!org.login)
      return this.commandError(
        interaction,
        `Unable to get organization info for \`${query}\``
      );

    const members = await GitHub.getOrgMembers(org.login);

    const embed = new this.embed()
      .setTitle(org.name)
      .setURL(org.html_url)
      .setColor(0x84f139)
      .setDescription(`${org.description}\n`)
      .setThumbnail(org.avatar_url)
      .setTimestamp()
      .addField('Website', org.blog || 'None', true)
      .addField('Location', org.location || 'Unknown', true)
      .addField(
        'Created At',
        moment(org.created_at).format('MMMM Do, YYYY. h:mm A'),
        true
      )
      .addField('Repos', String(org.public_repos), true)
      .addField(
        'Members',
        members.length
          ? members
              .map((m) => `• [${m.login}](${m.html_url})`)
              .slice(0, 15)
              .join('\n')
          : 'No public members found'
      );

    return interaction.editReply({ embeds: [embed] });
  }
}

module.exports = Organization;
