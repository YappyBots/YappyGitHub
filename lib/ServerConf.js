const db = require('sqlite');
const path = require('path');
const dbPath = path.resolve(__dirname, '../db/serverconf.sqlite');
const Collection = require('./Collection');
const Log = require('./Logger').Logger;

const default_conf = {
  server_id: null,
  server_name: null,
  prefix: 'G! ',
  repo: null,
  "default": true
}
const conf_keys = ['prefix', 'repo'];;

/**
* A channel configuration class to add, set, delete repo events config from channels
* @extends Collection
*/
class ServerConf extends Collection {

  /**
  * Inits the guilds configuration by getting database rows, and initializes guilds that don't have config yet
  * @return void
  */
  init(bot) {
    let conf = this;

    db.open(dbPath).then(() => {
      return db.all(`SELECT * FROM server_configs`);
    }).then(rows => {
      for (const row of rows) conf.set(row.server_id, row);
      for (const guild of bot.guilds) {
        if (!conf.has(guild[1].id)) {
          conf.add(guild[1]).then(config => {
            conf.set(guild[1].id, config);
          }).catch(Log.error);
        }
      }
    }).catch(err => Log.error(err));

    bot.on('guildDelete', (guild) => {
      if (!conf.has(guild.id)) return false;
      conf.delete(guild.id);
    });
  }

  /**
  * Create guild config
  * @param {String} guild The guild's object
  * @return {Promise<Object>}
  */
  add(guild) {
    let conf = this;

    Log.debug(`Adding ${guild.name} to server conf..`);

    return new Promise((resolve, reject) => {
      if (conf.has(guild.id)) return reject('Server is already in the configuration');
      db.open(dbPath).then(() => {
        db.run(`INSERT INTO "server_configs" (server_id, server_name, prefix, repo) VALUES (?, ?, ?, ?)`, [guild.id, guild.name, default_conf.prefix, default_conf.repo]).then(() => {
          resolve({
            server_id: guild.id,
            server_name: guild.name,
            prefix: default_conf.prefix,
            repo: default_conf.repo
          });
        }).catch(reject);
      }).catch(reject);
    });
  }

  /**
  * Get the server config for a spefic server
  * @param  {String} server_id The channel's id
  * @return {ServerConfig}     The server's config
  */
  grab(guild) {
    if (!guild) return false;
    let config = this;

    if(config.has(guild.id)) {
      let server_conf = config.get(guild.id);
      const conf = {};
      if (server_conf) {
        for (let key in server_conf) {
          if (server_conf[key]) {
            conf[key] = server_conf[key];
          } else {
            conf[key] = default_conf[key];
          }
        }
        conf["default"] = false;
      }
      return conf;
    } else return default_conf;
  }

  change(guild, key, value) {
    let conf = this;

    let args = arguments;

    return new Promise((resolve, reject) => {

      // fml
      key = key && key.replace ? key.replace(/[';]/g, '') : key;
      value = value && value.replace ? value.replace(/[';]/g, '') : value;

      if (!key || (!value && key !== 'repo')) return reject(`❌ Value or key hasn't been provided. Key: \`${key}\`. Value: \`${value}\``);
      if (!value) value = null;

      let server_id = guild.id;

      if (!conf.has(server_id)) {
        return reject(`❌ The server **${guild.name}** was not found while trying to set config \`${key}\` to \`${value}\``);
      }

      let thisconf = conf.get(guild.id);

      if (['server_id', 'server_name'].includes(key)) return reject(`❌ The key \`${key}\` is read-only.`);
      if (!conf_keys.includes(key)) return reject(`❌ The key \`${key}\` doesn't exist.`);

      thisconf[key] = value;
      conf.set(server_id, thisconf);

      if (isNaN(value)) value = `'${value}'`;
      let query = `UPDATE "server_configs" SET ${key} = ${value} WHERE server_id = '${server_id}'`;

      db.open(dbPath).then(() => {
        return db.run(query);
      }).then(() => {
        resolve(`✅ Successfully set config key \`${key}\` to \`${value}\``)
      }).catch((e) => {
        Log.error(e);
        reject(`❌ Unable to update database key.`);
      })

    });
  }

  /**
  * Delete a spefic channel's repo configuration
  * @param  {String} server_id      The channel id for which to delete the info
  * @return {Promise<Collection>}    Returns a promise resolving all the channel conf
  */
  delete(server_id) {
    return new Promise((resolve, reject) => {
      if (!this.has(server_id)) return reject('Server doesn\'t have any config to delete');
      db.open(dbPath).then(() => {
        db.run(`DELETE FROM server_configs WHERE server_id = ${server_id}`).then(() => {
          this.delete(server_id);
          resolve(this);
        }).catch(reject);
      })
    });
  }

}

module.exports = new ServerConf();
