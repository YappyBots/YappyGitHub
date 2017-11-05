# Contributing to Yappy Github

### Clone repo

```sh
$ cd folder/where/i/want/bot
$ git clone https://github.com/YappyBots/YappyGithub.git
```

### Linting

Please use an ESLint plugin for your editor, and use the current configuration (located in `.eslintrc`).

### Github Events

The different [Github events](https://developer.github.com/v3/activity/events/types/) each have their own name, followed by "Event" (the actual webhook event name doesn't include the "Event").

An event may have an action. For example, the event can be an `issue` event, and the action may be `open`.
The file that will be read for the styling of the event is `EVENT-ACTION.js`, everything being lowercase.

### Setting up

Yappy Github needs some settings to be set. Copy `.env.example` to `.env` and fill in the settings.

The following settings are required:
- `DISCORD_TOKEN`
- `DB_URL`
- `DISCORD_CLIENT_ID` (for the web dashboard)
- `DISCORD_CLIENT_SECRET` (for the web dashboard)

You will also need to run `npm i` to install all dependencies needed.

### Running the bot

Yappy Github needs to be run with NodeJS v8 or higher flag.
An example on running the bot:

```sh
$ node lib/index.js
```
