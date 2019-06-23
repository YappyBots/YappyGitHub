const _ = require('lodash');

module.exports = bookshelf =>
  (bookshelf.Model = bookshelf.Model.extend(
    {
      parse: function(attrs) {
        const clone = _.mapKeys(attrs, function(value, key) {
          return _.camelCase(key);
        });

        if (this.casts)
          Object.keys(this.casts).forEach(key => {
            const type = this.casts[key];
            const val = clone[key];

            if (type === 'boolean' && val !== undefined) {
              clone[key] = !(val === 'false' || val == 0);
            }

            if (type === 'array') {
              clone[key] = val ? JSON.parse(val) : [];
            }
          });

        return clone;
      },
      format: function(attrs) {
        const clone = _.mapKeys(attrs, function(value, key) {
          return _.snakeCase(key);
        });

        if (this.casts)
          Object.keys(this.casts).forEach(key => {
            const type = this.casts[key];
            const val = clone[key];

            if (type === 'boolean' && val !== undefined) {
              clone[key] = Number(val === true || val === 'true');
            }

            if (type === 'array' && val) {
              clone[key] = JSON.stringify(val);
            }
          });

        return clone;
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
