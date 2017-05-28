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

  run(msg, args) {
    const commitOrBranch = args[0];
    let embedData = {
      title: 'Updating',
      color: 0xFB9738,
      description: '\u200B',
      fields: [],
      footer: {
        text: this.bot.user.username,
        icon_url: this.bot.user.avatarURL(),
      },
    };
    let message;

    return msg.channel.send({
      embed: embedData,
    })
    .then(m => {
      message = m;
      return this.exec('git pull');
    })
    .then(stdout => {
      if (stdout.includes('Already up-to-date')) {
        return this.addFieldToEmbed(message, embedData, {
          name: 'Git Pull',
          value: 'Already up-to-date',
        }).then(m => {
          embedData = m.embeds[0];
          return Promise.reject('No update');
        });
      }
      return this.addFieldToEmbed(message, embedData, {
        name: 'Git Pull',
        value: `\`\`\`sh\n${stdout}\n\`\`\``,
      });
    })
    .then(() => {
      if (commitOrBranch) return this.exec(`git checkout ${commitOrBranch}`);
      return;
    })
    .then(this.getDepsToInstall)
    .then(info => {
      if (!info) return Promise.resolve();
      return this.addFieldToEmbed(message, embedData, {
        name: 'Dependencies',
        value: [
          ...(info.install.length ? ['**Install:**', [...info.install].map(e => `- \`${e[0]}@${e[1]}\`\n`).join('')] : []),
          ...(info.update.length ? ['**Update:**', info.update.map(e => `- \`${e[0]}@${e[1]} -> ${e[2]}\`\n`).join('')] : []),
          ...(info.remove.length ? ['**Remove:**', [...info.remove].map(e => `- \`${e[0]}@${e[1]}\`\n`).join('')] : []),
        ].join('\n'),
      }).then(() => info);
    })
    .then(info => {
      if (!info) return Promise.resolve();
      return this.installDeps(info).then(stdouts =>
        this.addFieldToEmbed(message, embedData, {
          name: 'Yarn',
          value: stdouts.map(stdout => `\`\`\`sh\n${stdout}\n\`\`\``).join('\n'),
        })
      );
    })
    .then(() => message.channel.send({ embed: {
      color: 0x2ECC71,
      title: 'Updating',
      description: 'Restarting...',
    } }))
    .then(() => {
      Log.info('RESTARTING - Executed `update` command');
      process.exit(0);
    })
    .catch(err => {
      if (err === 'No update') return;
      return this.commandError(msg, err);
    });
  }

  getDepsToInstall() {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(__dirname, '../../../package.json'), (err, content) => {
        if (err) return reject(err);
        const afterPackageJSON = JSON.parse(content);
        delete afterPackageJSON.dependencies.debug;
        const diff = jsondiffpatch.diff(beforePackageJSON.dependencies, afterPackageJSON.dependencies);
        if (!diff) return resolve();
        let data = {
          install: Object.keys(diff).filter(e => diff[e].length === 1).map(e => [e, diff[e][0]]),
          update: Object.keys(diff).filter(e => diff[e].length === 2).map(e => [e, diff[e][0], diff[e][1]]),
          remove: Object.keys(diff).filter(e => diff[e].length === 3).map(e => [e, diff[e][0]]),
        };
        resolve(data);
      });
    });
  }

  async installDeps(data) {
    let stdouts = [
      data.install.length && await this.exec(`yarn add --no-progress ${data.install.map(e => `${e[0]}@${e[1]}`).join(' ')}`),
      data.update.length && await this.exec(`yarn upgrade --no-progress ${data.update.map(e => `${e[0]}@${e[1]}`).join(' ')}`),
      data.remove.length && await this.exec(`yarn remove --no-progress ${data.remove.map(e => e[0]).join(' ')}`),
    ];
    return stdouts.filter(e => !!e);
  }

  addFieldToEmbed(message, data, field) {
    data.fields.push(field);
    return message.edit({ embed: data });
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
