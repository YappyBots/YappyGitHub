const files = [
  require('./welcome'),
  require('./faq'),
];

const categories = {};
for (const file of files) {
  file.category = file.category.toLowerCase();
  if (!categories[file.category]) {
    categories[file.category] = [];
  }
  categories[file.category].push(file);
}

module.exports = categories;
