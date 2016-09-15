module.exports = bot => (msg, command) => {
  let currentTime = new Date().getTime();
  let difference = currentTime - msg.timestamp;
  if (difference > 999) {
    difference = difference / 1000;
  }

  return msg.channel.sendMessage(`Ping, Pong! Took ${difference} ${currentTime - msg.timestamp > 999 ? 's' : 'ms'}`);
}
