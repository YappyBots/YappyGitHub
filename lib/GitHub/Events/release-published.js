const EventResponse = require('../EventResponse');

class Release extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever a release is published',
    });
  }

  embed(data) {
    const { release } = data;
    const {
      name,
      body,
      prerelease,
      tag_name: tag,
      target_commitish: branch,
      html_url,
    } = release;

    return {
      color: `#f0c330`,
      title: `Published ${
        prerelease ? 'pre-release' : 'release'
      } \`${tag}\` (${this.escape(name)}) from branch \`${branch}\``,
      description: this.shorten(body, 1000),
      url: html_url,
    };
  }

  text(data) {
    const { sender, release } = data;
    const {
      prerelease,
      name,
      tag_name: tag,
      target_commitish: branch,
      html_url,
    } = release;

    return [
      `📡 **${sender.login}** published ${
        prerelease ? 'pre-release' : 'release'
      } **${this.escape(name)}** (${tag}) on branch \`${branch}\``,
      `<${html_url}>`,
    ].join('\n');
  }
}

module.exports = Release;
