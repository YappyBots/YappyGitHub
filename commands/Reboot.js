const { exec } = require('child_process');
const Log = require('../lib/Logger').Logger;
const Command = require('../lib/Structures/Command');

class UpdateCommand extends Command {
  constructor(bot) {
    super(bot);

    this.props.help = {
      name: 'reboot',
      description: 'reboot the bot',
      usage: 'reboot'
    };

    this.setConf({
      permLevel: 2
    })
  }

  run(msg, args) {
    return msg.channel.send([
      '**REBOOT**',
      '',
      'Rebooting...'
    ]).then(() => {
      process.exit();
    })
  }
}


module.exports = UpdateCommand;
