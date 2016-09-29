const { spawn, exec } = require('child_process');
const now = require('performance-now');
const Log = require('../lib/Logger').Logger;
const Owner = '175008284263186437';

const Exec = (cmd, opts = {}) => {
  let startTime = now();
  let endTime;
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      endTime = now();
      if (err) return reject({ stderr, startTime, endTime });
      resolve({ stdout, startTime, endTime });
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

module.exports = bot => (msg, command) => {
  if (msg.author.id !== Owner) return false;

  let runningMessage = [
    '`RUNNING`',
    '```xl',
    clean(command),
    '```'
  ].join('\n')

  let messageToEdit;

  msg.channel.sendMessage(runningMessage).then(message => {
    messageToEdit = message;
  }).then(() => Exec(command))
  .then(data => {
    let { stdout, startTime, endTime } = data;

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
    let { stderr, startTime, endTime } = data;

    stderr = stderr.substring(0, stderr.length - 1);

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
