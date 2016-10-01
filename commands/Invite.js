const message = [
  'To invite Yappy to your server: https://discordapp.com/oauth2/authorize?client_id=219218963647823872&scope=bot&permissions=67439616',
  '',
  '__Instructions__:',
  '  1. Create webhook to http://discordjsrewritetrello-datitisev.rhcloud.com',
  '    - Don\'t select all the events or just select push',
  '    - You can set all of them except watch and fork',
  '      (they are a little buffy for some reason and spam)',
  '  2. Run `G! init user/repo` in the channel where you want to get the events'
];

module.exports = (bot) => (msg, command, args) => {
  msg.channel.sendMessage(message);
}
