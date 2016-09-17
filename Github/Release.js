module.exports = payload => {
  let actor = payload.actor;
  let release = payload.payload.release;

  let msg = `📡 **${actor.login}** published ${release.prerelease ? 'pre-release' : 'release'} **${release.name}** (${release.tag_name}) on branch ${release.target_commitish} \n`;
msg += `<${release.html_url}>`;

  return msg;
}
