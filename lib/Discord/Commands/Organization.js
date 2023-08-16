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
      .addFields([
        {
          name: 'Website',
          value: org.blog || 'None',
          inline: true,
        },
        {
          name: 'Location',
          value: org.location || 'Unknown',
          inline: true,
        },
        {
          name: 'Created At',
          value: moment(org.created_at).format('MMMM Do, YYYY. h:mm A'),
          inline: true,
        },
        {
          name: 'Members',
          value: members.length
            ? members
                .map((m) => `- [${m.login}](${m.html_url})`)
                .slice(0, 15)
                .join('\n')
            : 'No public members found',
          inline: true,
        },
        {
          name: 'Repos',
          value: String(org.public_repos),
          inline: true,
        },
      ]);

    return interaction.editReply({ embeds: [embed] });
  }
}

module.exports = Organization;
