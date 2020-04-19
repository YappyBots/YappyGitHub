const isFound = (data, item) =>
  data.includes(item) || data.includes(item.split('/')[0]);

module.exports = {
  whitelist: (data) => (item) => isFound(data || [], item || ''),
  blacklist: (data) => (item) => !isFound(data || [], item || ''),
};
