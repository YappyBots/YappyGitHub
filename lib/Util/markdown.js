const showdown = require('showdown');
const TurndownService = require('turndown');

const ghConverter = new showdown.Converter();

ghConverter.setFlavor('github');
ghConverter.setOption('tasklists', false);
ghConverter.setOption('tables', false);

ghConverter.addExtension(() => ({
  type: 'output',
  regex: /<li>\[(x|\s*?)]/gm,
  replace: (match, p1) => `<li>${p1 === 'x' ? '☑' : '☐'}`,
}));

const turndownService = new TurndownService({
  codeBlockStyle: 'fenced',
});

module.exports.convert = (text, limit) => {
  if (!text?.length) {
    return '';
  }

  let converted = text;

  try {
    const html = ghConverter.makeHtml(converted);
    converted = turndownService.turndown(html);
  } catch (e) {
    Log.error(e);
  }

  if (limit && converted.length > limit) {
    return `${converted.slice(0, limit).trim()} …`;
  }

  return converted;
};
