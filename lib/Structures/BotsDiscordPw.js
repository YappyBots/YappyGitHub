const superagent = require('superagent');
const Log = require('../Logger').Logger;

class BotsDiscordPW {

  constructor(bot) {
    this._bot = bot;

    if (!process.env.CARBONITEX_KEY) return false;

    Log.debug('Sending Carbonitex stats');

    // this.sendPwStats().catch(Log.error);
    this.sendCarbonitexStats().catch(Log.error);

    bot.on('guildCreate', () => {
      // this.sendPwStats();
      this.sendCarbonitexStats();
    });
    bot.on('guildDelete', () => {
      // this.sendPwStats();
      this.sendCarbonitexStats();
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

  sendCarbonitexStats() {
    let bot = this._bot;

    return new Promise((resolve, reject) => {
      superagent
      .post('https://www.carbonitex.net/discord/data/botdata.php')
      .send({
        key: process.env.CARBONITEX_KEY,
        server_count: bot.guilds.size,
      })
      .end((err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  }

}

module.exports = BotsDiscordPW;
