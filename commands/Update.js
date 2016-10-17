const { exec } = require('child_process');
const Log = require('../lib/Logger').Logger;
const Command = require('../lib/Structures/Command');

class UpdateCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'update',
      description: 'update the bot',
      usage: 'say'
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
        return msg.channel.sendMessage(message);
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

        return msg.channel.sendMessage(message)
      }

    }).then(() => this._installDeps())
    .then(() => {
      msg.channel.sendMessage([
        'Installed dependencies!',
        '',
        'Rebooting...'
      ]);

      Object.keys(require.cache).forEach(key => delete require.cache[key]);

      process.exit();
    }).catch(err => {
      Log.error(err);
      msg.channel.sendMessage([
        `An error occurred while trying to update bot`,
        '```js',
        err,
        '```',
        '',
        'Rebooting...'
      ]);

      Object.keys(require.cache).forEach(key => delete require.cache[key]);

      process.exit();
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
    return this._exec('npm install --no-optional')
  }
}


module.exports = UpdateCommand;
