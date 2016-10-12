const WebhookRelease = (data) => {
  let release = data.release;
  let prerelease = release.prerelease;
  let tag = release.tag_name;
  let name = release.name;
  let branch = release.target_commitish;

  return {
    attachments: [{
      title: `Published ${prerelease ? 'pre-release' : 'release'} \`${tag}\` (${name}) on branch \`${branch}\``,
      title_link: release.html_url,
      color: '#F0C330'
    }]
  };

}

module.exports = data => {
  let actor = data.sender;
  let release = data.release;

  let msg = `📡 **${actor.login}** published ${release.prerelease ? 'pre-release' : 'release'} **${release.name}** (${release.tag_name}) on branch \`${release.target_commitish}\` \n`;
  msg += `<${release.html_url}>\n`;

  return {
    str: msg,
    payload: data,
    webhook: WebhookRelease(data)
  };
}
