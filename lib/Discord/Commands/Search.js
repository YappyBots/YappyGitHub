const Command = require('../Command');
const GitHub = require('../../GitHub');
const moment = require('moment');

class GitHubSearch extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'search',
      summary: 'Search repos and users.',
      description:
        'Search repos and users.\nType can be any of the following: `repos`, `repositories`, `users`, and a few more.',
      usage: 'search <repos|users> <query>',
      examples: ['search repos yappygithub', 'search users datitisev'],
    };
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addSubcommand((subcommand) =>
        subcommand
          .setName('repos')
          .setDescription('Search repositories on GitHub.')
          .addStringOption((option) =>
            option
              .setName('query')
              .setDescription('Search query')
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('users')
          .setDescription('Search users on GitHub.')
          .addStringOption((option) =>
            option
              .setName('query')
              .setDescription('Search query')
              .setRequired(true)
          )
      );
  }

  async run(interaction, args) {
    await interaction.deferReply();

    const type = interaction.options.getSubcommand();
    const query = interaction.options.getString('query', true);

    const data = await GitHub.search(type, query);

    const { total_count: total, incomplete_results, items } = data;

    if ((!total || total === 0) && !incomplete_results) {
      this.commandError(
        interaction,
        'No results found',
        `Search \`${query}\` of \`${type}\``
      );
    } else if (total === 0 && incomplete_results) {
      this.commandError(
        interaction,
        "GitHub didn't find all results, and no results were found",
        `Search \`${query}\` of \`${type}\``
      );
    } else {
      if (items[0].type === 'User')
        return this.users({ interaction, type, query, data });
      if (items[0].default_branch)
        return this.repos({ interaction, type, query, data });
      return this.commandError(
        interaction,
        'Unknown items were returned from the search',
        `Search \`${query}\` of \`${type}\``
      );
    }
  }

  users({ interaction, data }) {
    const item = data.items[0];

    return GitHub.getUserByUsername(item.login).then((user) => {
      const embed = new this.embed({
        title: user.login,
        url: user.html_url,
        color: 0x84f139,
        description: `${user.bio || '\u200B'}\n`,
        thumbnail: {
          url: user.avatar_url,
        },
        timestamp: Date.now(),
        fields: [
          {
            name: 'Name',
            value: user.name || user.login,
            inline: true,
          },
          {
            name: 'Company',
            value: user.company || 'None',
            inline: true,
          },
          {
            name: 'Repos',
            value: String(user.public_repos) || 'Unknown',
            inline: true,
          },
          {
            name: 'Since',
            value: moment(user.created_at).format('MMMM Do, YYYY. h:mm A'),
            inline: true,
          },
        ],
      });

      return interaction.editReply({ embeds: [embed] });
    });
  }

  repos({ interaction, data }) {
    const repo = data.items[0];

    const embed = new this.embed({
      title: repo.full_name,
      url: repo.html_url,
      color: 0x84f139,
      description: `${repo.description || '\u200B'}\n`,
      thumbnail: {
        url: repo.owner.avatar_url,
      },
      timestamp: Date.now(),
      fields: [
        {
          name: repo.owner.type,
          value: repo.owner
            ? `[${repo.owner.name || repo.owner.login}](${repo.owner.html_url})`
            : 'Unknown',
          inline: true,
        },
        {
          name: 'Stars',
          value: String(repo.stargazers_count),
          inline: true,
        },
        {
          name: 'Forks',
          value: String(repo.forks),
          inline: true,
        },
        {
          name: 'Open Issues',
          value: repo.has_issues ? String(repo.open_issues) : 'Disabled',
          inline: true,
        },
        {
          name: 'Language',
          value: repo.language || 'Unknown',
          inline: true,
        },
      ],
    });

    return interaction.editReply({ embeds: [embed] });
  }
}

module.exports = GitHubSearch;
