const EventResponse = require('../EventResponse');

class Release extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever a release is published',
    });
  }

  embed(data) {
    const { release, prerelease } = data;
    const { name, body, tag_name: tag, target_commitish: branch } = release;

    return {
      color: `#f0c330`,
      title: `Published ${
        prerelease ? 'pre-release' : 'release'
      } \`${tag}\` (${this.escape(name)}) from branch \`${branch}\``,
      description: this.shorten(body, 1000),
    };
  }

  text(data) {
    const { sender, release } = data;
    return [
      `📡 **${sender.login}** published ${
        release.prerelease ? 'pre-release' : 'release'
      } **${this.escape(release.name)}** (${release.tag_name}) on branch \`${
        release.target_commitish
      }\``,
      `<${data.release.html_url}>`,
    ].join('\n');
  }
}

module.exports = Release;
