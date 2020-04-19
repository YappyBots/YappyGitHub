const knex = require('knex')(require('../../knexfile'));

const bookshelf = require('bookshelf')(knex);

bookshelf.plugin('bookshelf-case-converter-plugin');
bookshelf.plugin([__dirname + '/plugin.js']);

module.exports = bookshelf;
