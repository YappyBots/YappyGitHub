const { spawn, exec } = require('child_process');
const Command = require('../lib/Structures/Command');
const Log = require('../lib/Logger').Logger;
const Owner = '175008284263186437';

const Exec = (cmd, opts = {}) => {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      if (err) return reject({ stderr });
      resolve({ stderr, stdout });
    });
  })
}
const clean = text => {
  if (typeof text === 'string') {
    return text.replace('``', '`' + String.fromCharCode(8203) + '`');
  }
  else {
    return text;
  }
}

class ExecCommand extends Command {

  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'exec',
      description: 'Exec command, admin only',
      usage: 'exec <command>'
    }

    this.setConf({
      permLevel: 2
    });

  }

  run(msg, args) {
    let command = args.join(' ');

    let runningMessage = [
      '`RUNNING`',
      '```xl',
      clean(command),
      '```'
    ].join('\n')

    let messageToEdit;

    msg.channel.send(runningMessage).then(message => {
      messageToEdit = message;
    }).then(() => Exec(command))
    .then(data => {
      let { stdout } = data;

      stdout = stdout.substring(0, stdout.length - 1);

      let message = [
        '`EXEC`',
        '```xl',
        clean(command),
        '```',
        '`STDOUT`',
        '```xl',
        clean(stdout),
        '```'
      ].join('\n');

      messageToEdit.edit(message);
    }).catch(data => {
      if (data && data.stack) {
        Log.error(data);
        throw data;
      }
      let { stderr } = data;

      stderr = stderr.substring(0, 1900);

      let message = [
        '`EXEC`',
        '```xl',
        clean(command),
        '```',
        '`STDERR`',
        '```xl',
        clean(stderr),
        '```'
      ].join('\n');

      messageToEdit.edit(message);
    });

  }
}

module.exports = ExecCommand;
