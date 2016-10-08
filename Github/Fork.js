module.exports = payload => {
  return `🍝 **${payload.sender.login}** forked ${payload.repository.full_name}\n`;
}
