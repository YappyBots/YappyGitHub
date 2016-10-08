module.exports = payload => {
  let isWatching = payload.action == 'started';
  return `👀 **${payload.sender.login}** is ${isWatching ? 'now' : 'no longer'} hydrabolt/discord.js`;
}
