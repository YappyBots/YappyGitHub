const superagent = require('superagent');
const Log = require('../Logger').Logger;

class BotsDiscordPW {

  constructor(bot) {
    this._bot = bot;

    if (!process.env.BDPW_KEY) return false;

    this.sendPwStats().catch(Log.error);

    bot.on('guildCreate', (guild) => {
      this.sendPwStats();
    });
    bot.on('guildDelete', (guild) => {
      this.sendPwStats();
    });
  }

  sendPwStats() {
    let bot = this._bot;

    return new Promise((resolve, reject) => {
      superagent
      .post('https://bots.discord.pw/api/bots/219218963647823872/stats')
      .send({
        server_count: bot.guilds.size
      })
      .set('Authorization', process.env.BDPW_KEY)
      .end((err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

}

module.exports = BotsDiscordPW;
