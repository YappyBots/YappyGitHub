const Webcord = require('Webcord');
const path = require('path');
const WebhookClient = new Webcord.WebhookClient();

let Webhook = WebhookClient.connect(process.env.WEBHOOK_URL).then(webhook => Webhook = webhook);

const pathname = path.join(__dirname, '/../..');
console.log(pathname);

class ErrorLogger {

  constructor() {
    this.error = this.error.bind(this);
  }

  init(bot) {
    bot.on('error', this.error);
    bot.on('disconnected', () => this.warning('Disconnected'));
    bot.on('ready', () => this.success('Connected'));
  }

  error(err, title = 'Yappy encounted a problem', msg) {

    if (err.stack) {
      for (let i = 0; i < err.stack.length; i++) {
        err.stack = err.stack.replace(pathname, '.');
      }

      err = [
        '```js',
        err.stack,
        '```'
      ].join('\n');
    }

    let message = null;

    if (msg) {
      message = [
        `Message by **@${msg.author.username}#${msg.author.discriminator}** in _${msg.guild ? msg.guild.name : `a DM`}_`,
        '```',
        msg.content,
        '```'
      ].join('\n');
    }

    this._message({
      color: 'danger',
      title: title,
      msg: err,
      pretext: message
    });
  }

  warning(err, title = 'Yappy encounted a problem') {
    if (err.stack) err = err.stack;

    this._message({
      title,
      color: 'warning',
      msg: err
    });
  }

  success(msg, title = 'Yappy is functional') {

    this._message({
      title, msg,
      color: 'good',
    })

  }


  _message({ color = '#ff0000', title = 'Yappy got a log', msg = 'No data was sent', pretext }) {

    let message = `${pretext || ''}\n\n${msg}`;

    Webhook.sendSlack({
      username: 'Yappy Alerts',
      attachments: [{
        color,
        fields: [{
          title: `**${title}**`,
          value: message
        }],
        footer: 'Alert',
        footer_icon: 'https://cdn.discordapp.com/avatars/219218963647823872/db51d3838477022e0b04e8c4601f4ab3.jpg',
        ts: Date.now() / 1000
      }],
    }).catch(err => console.log(msg.body));
  }

}

module.exports = new ErrorLogger();
