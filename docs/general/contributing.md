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

### Starting the bot

Yappy Github needs the following environment variables:

- **REQUIRED** `YAPPY_GITHUB_DISCORD` - discord bot token
- **REQUIRED** `YAPPY_GITHUB_MONGODB` - a MongoDB database to insert data
- **OPTIONAL** `GITLAB_TOKEN` - a gitlab token
- **OPTIONAL** `YAPPY_GITHUB_BUGSNAG` - a bugsnag token
- **OPTIONAL** `YAPPY_GITHUB_SENTRY` - a sentry token

Yappy GitLab also needs to be run with NodeJS v7 or higher and the `--harmony` (only if you are in NodeJS v7) flag.
An example on running the bot:

```sh
$ YAPPY_GITHUB_DISCORD=IAmAtoken node --harmony lib/index.js
```
