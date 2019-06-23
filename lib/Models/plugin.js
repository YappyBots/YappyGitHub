const _ = require('lodash');

module.exports = bookshelf =>
  (bookshelf.Model = bookshelf.Model.extend(
    {
      parse: function(res) {
        return _.mapKeys(res, function(value, key) {
          return _.camelCase(key);
        });
      },
      format: function(attrs) {
        const clone = Object(attrs);

        if (this.casts)
          Object.keys(this.casts).forEach(key => {
            if (this.casts[key] === 'boolean' && clone.useEmbed !== undefined) {
              clone[key] = Number(clone[key] === true || clone[key] === 'true');
            }
          });

        return _.mapKeys(clone, function(value, key) {
          return _.snakeCase(key);
        });
      },
    },
    {
      find(id, withRelated = []) {
        return this.forge({
          id,
        }).fetch({
          withRelated,
        });
      },
    }
  ));
