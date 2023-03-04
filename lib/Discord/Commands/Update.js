const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const jsondiffpatch = require('jsondiffpatch');
const beforePackageJSON = require('../../../package.json');
const Command = require('../Command');

class UpdateCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'update',
      description: 'update the bot',
      usage: 'update [commit/branch]',
    };

    this.setConf({
      permLevel: 2,
    });
  }

  getSlashCommand() {
    return super
      .getSlashCommand()
      .addStringOption((option) =>
        option.setName('ref').setDescription('Specify ref to update to')
      );
  }

  async run(interaction) {
    const ref = interaction.options.getString('ref');

    let embedData = {
      title: 'Updating',
      color: 0xfb9738,
      description: '\u200B',
      fields: [],
      footer: {
        text: this.bot.user.username,
        icon_url: this.bot.user.avatarURL(),
      },
    };

    await interaction.deferReply({ ephemeral: true });

    return this.exec('git pull')
      .then((stdout) => {
        if (stdout.includes('Already up-to-date')) {
          return this.addFieldToEmbed(interaction, embedData, {
            name: 'Git Pull',
            value: 'Already up-to-date',
          }).then((m) => {
            embedData = m.embeds[0];
            return Promise.reject('No update');
          });
        }
        return this.addFieldToEmbed(interaction, embedData, {
          name: 'Git Pull',
          value: `\`\`\`sh\n${stdout.slice(0, 1000)}\n\`\`\``,
        });
      })
      .then(() => {
        if (ref) return this.exec(`git checkout ${ref}`);
        return;
      })
      .then(this.getDepsToInstall)
      .then((info) => {
        if (!info) return Promise.resolve();
        return this.addFieldToEmbed(interaction, embedData, {
          name: 'Dependencies',
          value: [
            ...(info.install.length
              ? [
                  '**Install:**',
                  [...info.install]
                    .map((e) => `- \`${e[0]}@${e[1]}\`\n`)
                    .join(''),
                ]
              : []),
            ...(info.update.length
              ? [
                  '**Update:**',
                  info.update
                    .map((e) => `- \`${e[0]}@${e[1]} -> ${e[2]}\`\n`)
                    .join(''),
                ]
              : []),
            ...(info.remove.length
              ? [
                  '**Remove:**',
                  [...info.remove]
                    .map((e) => `- \`${e[0]}@${e[1]}\`\n`)
                    .join(''),
                ]
              : []),
          ].join('\n'),
        }).then(() => info);
      })
      .then((info) => {
        if (!info) return Promise.resolve();
        return this.installDeps(info).then((stdouts) =>
          this.addFieldToEmbed(interaction, embedData, {
            name: 'NPM',
            value:
              stdouts.length > 0
                ? stdouts
                    .map(
                      (stdout) => `\`\`\`sh\n${stdout.slice(0, 1000)}\n\`\`\``
                    )
                    .join('\n')
                : 'No packages were updated',
          })
        );
      })
      .then(() =>
        interaction.followUp({
          embeds: [
            {
              color: 0x2ecc71,
              title: 'Updating',
              description: 'Restarting...',
            },
          ],
          ephemeral: true,
        })
      )
      .then(() => {
        Log.info('RESTARTING - Executed `update` command');
        process.exit(0);
      })
      .catch((err) => {
        if (err === 'No update') return;
        return this.commandError(interaction, err);
      });
  }

  getDepsToInstall() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.resolve(__dirname, '../../../package.json'),
        (err, content) => {
          if (err) return reject(err);
          const afterPackageJSON = JSON.parse(content);
          delete afterPackageJSON.dependencies.debug;
          const diff = jsondiffpatch.diff(
            beforePackageJSON.dependencies,
            afterPackageJSON.dependencies
          );
          if (!diff) return resolve();
          let data = {
            install: Object.keys(diff)
              .filter((e) => diff[e].length === 1)
              .map((e) => [e, diff[e][0]]),
            update: Object.keys(diff)
              .filter((e) => diff[e].length === 2)
              .map((e) => [e, diff[e][0], diff[e][1]]),
            remove: Object.keys(diff)
              .filter((e) => diff[e].length === 3)
              .map((e) => [e, diff[e][0]]),
          };
          resolve(data);
        }
      );
    });
  }

  async installDeps(data) {
    let stdouts = [
      data.install.length &&
        (await this.exec(
          `npm i --no-progress ${data.install
            .map((e) => `${e[0]}@${e[1]}`)
            .join(' ')}`
        )),
      data.update.length &&
        (await this.exec(
          `npm upgrade --no-progress ${data.update
            .map((e) => `${e[0]}@${e[1]}`)
            .join(' ')}`
        )),
      data.remove.length &&
        (await this.exec(
          `npm rm --no-progress ${data.remove.map((e) => e[0]).join(' ')}`
        )),
    ];
    return stdouts.filter((e) => !!e);
  }

  addFieldToEmbed(interaction, data, field) {
    data.fields.push(field);
    return interaction.editReply({ embeds: [data] });
  }

  exec(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
      exec(cmd, opts, (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve(stdout);
      });
    });
  }
}

module.exports = UpdateCommand;
