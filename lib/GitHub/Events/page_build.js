const EventResponse = require('../EventResponse');

class PageBuild extends EventResponse {
  constructor(...args) {
    super(...args, {
      description:
        'This response is fired whenever GitHub Pages does something.',
    });
  }
  embed(data) {
    const { build } = data;

    return {
      color: '#e74c3c',
      title: `GitHub Pages failed to build your site`,
      description: build.error.message
    };
  }
  text(data) {
    const { repository, build } = data;

    return [`📃 GitHub Pages failed to build your site.`, build.error.message, `<${repository.html_url}>`];
  }

  ignore(data) {
    return data.build.status !== 'errored';
  }
}

module.exports = PageBuild;
