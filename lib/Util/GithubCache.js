const Collection = require('../Collection');
const GithubUrlParser = require('./GithubUrlParser');

class GithubCache extends Array {

  constructor(repos) {
    super();

    this.add(repos);
  }

  init(ChannelConf) {
    let repos = ChannelConf.FindAll().array().map(e => e.repo);

    this.add(repos);
  }

  add(repos = []) {
    if (typeof repos == 'string') repos = [repos];

    for (let i = 0; i < repos.length; i++) {
      let data = GithubUrlParser.Parse(repos[i]);
      if (data && data.repo && !this.exists(data.repo)) this.push(data.repo);
    }

    return this;
  }

  exists(repo) {
    return this.indexOf(repo) > -1;
  }

  delete(repo) {
    this.slice(this.indexOf(repo), 1);
    return this;
  }

}

module.exports = new GithubCache();
