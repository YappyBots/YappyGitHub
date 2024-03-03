const EventResponse = require('../EventResponse');

// Do not show description in the embed if it is a draft.
class ReleaseCreated extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired whenever a release is created or drafted (not published!)',
    });
  }

  embed(data) {
    const {
      name,
      body,
      draft,
      prerelease,
      tag_name: tag,
      target_commitish: branch,
      html_url,
    } = data.release;

    return {
      color: `#f0c330`,
      title: `${draft ? 'Drafted' : 'Created'} ${
        prerelease ? 'pre-release' : 'release'
      } \`${tag || '-'}\` (${this.escape(name)}) from branch \`${branch}\``,
      description: draft ? '' : this.shorten(body, 1000),
      url: html_url,
    };
  }

  text(data) {
    const { sender, release } = data;
    const {
      login,
      prerelease,
      draft,
      name,
      tag_name: tag,
      target_commitish: branch,
      html_url,
    } = release;

    return [
      `📡 **${login}** ${draft ? 'drafted' : 'created'} ${
        prerelease ? 'pre-release' : 'release'
      } **${this.escape(name)}** (${tag || '-'}) on branch \`${branch}\``,
      `<${html_url}>`,
    ].join('\n');
  }

  // Do not send event if it has already been published. Published releases send ~3 events: created, published, and (pre)released.
  ignore(data) {
    return !!data?.release?.published_at;
  }
}

module.exports = ReleaseCreated;
