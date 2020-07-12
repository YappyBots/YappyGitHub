const path = require('path');
const git = require('git-rev-sync');

class YappyGitHub {
  constructor() {
    this.directories = {
      root: path.resolve(__dirname, '../../'),
      Discord: path.resolve(__dirname, '../Discord'),
      DiscordCommands: path.resolve(__dirname, '../Discord/Commands'),
      GitHub: path.resolve(__dirname, '../GitHub'),
      Models: path.resolve(__dirname, '../Models'),
      Util: __dirname,
    };
    this.git = {
      release: git.long(),
    };
  }
}

module.exports = new YappyGitHub();
