const { exec } = require('child_process');
const path = require('path');
const Log = require('./Log');

class YappyGithub {
  constructor() {
    this.directories = {
      root: path.resolve(__dirname, '../../'),
      Discord: path.resolve(__dirname, '../Discord'),
      DiscordCommands: path.resolve(__dirname, '../Discord/Commands'),
      Github: path.resolve(__dirname, '../Github'),
      Models: path.resolve(__dirname, '../Models'),
      Util: __dirname,
    };
    this.git = {
      release: '???',
      commit: '???',
    };
    this._setRelease().catch(Log.error);
    this._setCommit().catch(Log.error);
  }
  async execSync(command) {
    return new Promise((resolve, reject) => {
      exec(command, {
        cwd: this.directories.root,
      }, (err, stdout, stderr) => {
        if (err) return reject(stderr);
        resolve(stdout);
      });
    });
  }
  async _setRelease() {
    this.git.release = await this.execSync(`git describe --abbrev=0 --tags`);
  }
  async _setCommit() {
    this.git.commit = await this.execSync(`git rev-parse HEAD`);
  }
}

module.exports = new YappyGithub();
