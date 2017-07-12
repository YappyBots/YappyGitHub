const EventResponse = require('../EventResponse');

class Gollum extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This response is fired whenever the wiki is updated.',
    });
  }

  embed(data) {
    const page = data.pages[0];
    const action = page.action[0].toUpperCase() + page.action.slice(1, 99);

    return {
      title: `${action} page \`${page.title}\``,
      url: page.html_url,
      color: `#29bb9c`,
    };
  }

  text(data) {
    const actor = data.sender;
    const pages = data.pages;
    const actions = pages.map(e => {
      const action = e.action[0].toUpperCase() + e.action.slice(1, 99);
      return `${action} **${e.title}** (<${e.html_url}>)`;
    }).join('\n          ');


    return [
      `📰 **${actor.login}** modified the wiki`,
      `          ${actions}`,
    ].join('\n');
  }
}

module.exports = Gollum;
