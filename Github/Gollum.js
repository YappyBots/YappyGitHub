const WebhookGollum = (data) => {

  let page = data.pages[0];
  let action = page.action[0].toUpperCase() + page.action.slice(1, 99);

  return {
    attachments: [{

      title: `${action} page \`${page.title}\``,
      title_link: page.html_url,
      color: `#29BB9C`

    }]
  }

}

module.exports = (data) => {
  let actor = data.sender;
  let pages = data.pages;
  let actions = pages.map(e => {
    let action = e.action[0].toUpperCase() + e.action.slice(1, 99);
    return `${action} **${e.title}** (<${e.html_url}>)`;
  }).join('\n          ')

  let msg = `📰 **${actor.login}** modified the wiki\n          ${actions}`;

  return {
    str: msg,
    payload: data,
    webhook: WebhookGollum(data)
  };
}
