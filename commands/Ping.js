module.exports = bot => (msg, command) => {

  msg.channel.sendMessage(`Pinging...`).then(message => {
    let currentTime = new Date().getTime();
    let difference = currentTime - message.createdTimestamp;
    if (difference > 999) {
      difference = difference / 1000;
    }
    return message.edit(`Ping, Pong! Took ${difference} ${currentTime - message.createdTimestamp > 999 ? 's' : 'ms'}`);
  }).catch(console.log);
}
