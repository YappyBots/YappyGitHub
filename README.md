# Yappy, the Github Monitor

<span class="badge-patreon"><a href="https://www.patreon.com/YappyBots" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FYappyBots%2FYappyGithub.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FYappyBots%2FYappyGithub?ref=badge_shield)

Monitor your github repos by adding this bot to your server, set up a channel for it, and don't miss any events!

## Information

Join our Discord server at https://discord.gg/HHqndMG

### Commands

Prefixes are `G! ` (with space), custom prefix set up, or mention the bot.

__**Util**__:
  - `help` - a help command... yeah :P
  - `invite` - how to invite the bot and set up github events!
  - `clean` - cleans the bot's messages found in the last 100 messages
  - `ping` - uh... ping? pong!
  - `stats` - shows the stats of the bot... what else?

__**Github**__:
  - `issues search <query>` - search issues by any field in the global repo
  - `issue <number>` - gives info about that specific issue in the global repo
  - `pr search <query>` - search pull requests by any field in the global repo
  - `pr <number>` - gives info about that specific pr in the global repo
  - `release <query>` - gives info about a release that matches that query in its tag in the global repo

__**Admin**__:
  - `conf [view]` - views the server's config
  - `conf get <key>` - gets a specific config key in the server's config
  - `conf set <key> [value]` - sets the key to the value, `repo`'s value may be none to disable
  - `init <repo> [private]` - initialize repo events on channel
  - `remove` - remove repo events on channel

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FYappyBots%2FYappyGithub.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FYappyBots%2FYappyGithub?ref=badge_large)

### Developer Documentation

https://yappybots.github.io/#/docs/yappygithub/