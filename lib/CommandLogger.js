const Log = require('./Logger').Logger;
const GithubPrefix = 'G! ';

module.exports = bot => {

  bot.on('message', msg => {
    if (!msg.content.startsWith(Prefix) && !msg.content.startsWith(GithubPrefix) && !msg.content.startsWith(`<@!${bot.user.id}> `) && !msg.content.startsWith(`<@${bot.user.id}> `)) return false;

    let author = msg.author;
    let channel = msg.channel.guild ? `#${msg.channel.name}` : `${author.username}#${author.discriminator}`;
    let server = msg.channel.guild ? msg.channel.guild.name : `Private Message`;

    let message = `${server} > ${channel} > @${author.username}#${author.discriminator} : ${msg.content}`;

    Log.message(message);

  });

}
