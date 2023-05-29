# Yappy, the GitHub Monitor

<span class="badge-patreon"><a href="https://www.patreon.com/YappyBots" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FYappyBots%2FYappyGitHub.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FYappyBots%2FYappyGitHub?ref=badge_shield)

Monitor your github repos by adding this bot to your server, set up a channel for it, and don't miss any events!

## Information

Join our Discord server at https://discord.gg/HHqndMG

### Commands

You can use the following commands through Discord Slash Commands.

__**Util**__:
  - `help` - a help command... yeah :P
  - `invite` - how to invite the bot and set up github events!
  - `clean` - cleans the bot's messages found in the last 100 messages
  - `ping` - uh... ping? pong!
  - `stats` - shows the stats of the bot... what else?

__**GitHub**__:
  - `issue search <query>` - search issues by any field in the global repo
  - `issue info <number>` - gives info about that specific issue in the global repo
  - `pr search <query>` - search pull requests by any field in the global repo
  - `pr info <number>` - gives info about that specific pr in the global repo

__**Admin**__:
  - `conf option channel` - view & edit the channel config
  - `conf option guild` - view & edit the server config
  - `conf filter` - set filter whitelist/blacklist for channel
  - `setup` - add & remove connections (repos, installations in orgs/accounts) from channel

### Developer Documentation

https://yappybots.github.io/#/docs/yappygithub/