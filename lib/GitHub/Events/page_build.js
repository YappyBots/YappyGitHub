const EventResponse = require('../EventResponse');

class PageBuild extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired whenever a review request is removed from a pull request.',
    });
  }
  embed(data) {
    const { build } = data;

    return {
      color: '#149617',
      title: `GitHub Pages ${build.status}`,
    };
  }
  text(data) {
    const { repository, build } = data;

    return [`📃 GitHub Pages ${build.status}`, `<${repository.html_url}>`];
  }
}

module.exports = PageBuild;
