module.exports = payload => {
  let starred = payload.action === 'started';
  return `⭐ **${payload.sender.login}** ${starred ? 'starred' : 'unstarred'} ${payload.repository.full_name}`;
}
