# Frequently Asked Questions
These are just questions that get asked frequently, that usually have a common resolution.
If you have issues not listed here, please ask in the [Official Yappy Server](https://discord.gg/HHqndMG).

## I set up a Github webhook pointing to the website, but I don't see any events on the channel
Say `G! init <repo>` on the channel where you want the events.
`repo` can be a Github url or `username/repo`

## I added a webhook to the channel where I get events, but Yappy isn't using it
The Discord webhook must include "Yappy" or "Github" in its name.
Yappy must also have "Manage Webhooks" permission in that channel
