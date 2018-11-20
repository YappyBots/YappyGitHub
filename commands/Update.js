const { exec } = require('child_process');
const Log = require('../lib/Logger').Logger;
const Command = require('../lib/Structures/Command');

class UpdateCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'update',
      description: 'update the bot',
      usage: 'update'
    };

    this.setConf({
      permLevel: 2
    })
  }

  run(msg, args) {
    let needsDependencies = true;

    this._exec('git pull').then((stdout) => {

      if (stdout.includes('Already up-to-date.')) {
        needsDependencies = false;
        let message = [
          '**UPDATE**',
          '',
          'No update available!'
        ];
        msg.channel.send(message);
        throw "No update";
      } else {
        let message = [
          '**UPDATE**',
          '',
          'Finished fetching update!',
          `\`git pull\``,
          '\`\`\`xl',
          stdout,
          '\`\`\`',
          'Installing dependencies...'
        ];

        return msg.channel.send(message)
      }

    }).then(() => this._installDeps())
    .then(() => {
      Object.keys(require.cache).forEach(key => delete require.cache[key]);

      return msg.channel.send([
        'Installed dependencies!',
        '',
        'Rebooting...'
      ]);
    }).then(() => {
      process.exit();
    }).catch(err => {
      console.error(err);
      if (err === "No update") return false;
      Object.keys(require.cache).forEach(key => delete require.cache[key]);

      msg.channel.send([
        `An error occurred while trying to update bot`,
        '```js',
        err,
        '```',
        '',
        'Rebooting...'
      ]).then(() => process.exit());

    });
  }

  _exec(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
      exec(cmd, opts, (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve(stdout);
      });
    })
  }

  _installDeps() {
    return this._exec('yarn install')
  }
}


module.exports = UpdateCommand;
