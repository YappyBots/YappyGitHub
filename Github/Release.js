module.exports = data => {
  let actor = data.sender;
  let release = data.release;

  let msg = `📡 **${actor.login}** published ${release.prerelease ? 'pre-release' : 'release'} **${release.name}** (${release.tag_name}) on branch \`${release.target_commitish}\` \n`;
msg += `<${release.html_url}>\n`;

  return msg;
}
