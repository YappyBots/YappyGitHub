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
    this._setCommit().catch(Log.error);
    this._setRelease().catch(Log.error);
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
    try {
      this.git.release = await this.execSync(`git describe --abbrev=0 --tags`);
    } catch (e) {
      if (e.includes('fatal: No names found, cannot describe anything.')) this.git.release = 'Unreleased'; else Log.error(typeof e === 'object' ? e : new Error(e));
    }
  }
  async _setCommit() {
    this.git.commit = (await this.execSync(`git rev-parse HEAD`)).replace(/\n/, '');
  }
}

module.exports = new YappyGithub();
