const _ = require('lodash');

module.exports = (bookshelf) =>
  (bookshelf.Model = bookshelf.Model.extend(
    {
      parse: function (attrs) {
        const clone = _.mapKeys(attrs, function (value, key) {
          return _.camelCase(key);
        });

        if (this.casts)
          Object.keys(this.casts).forEach((key) => {
            const type = this.casts[key];
            const val = clone[key];

            if (type === 'boolean' && val !== undefined) {
              clone[key] = !(val === 'false' || val == 0);
            }

            if (type === 'array') {
              try {
                clone[key] = JSON.parse(val) || [];
              } catch (err) {
                clone[key] = [];
              }
            }
          });

        return clone;
      },
      format: function (attrs) {
        const clone = attrs;

        if (this.casts)
          Object.keys(this.casts).forEach((key) => {
            const type = this.casts[key];
            const val = clone[key];

            if (type === 'boolean' && val !== undefined) {
              clone[key] = Number(val === true || val === 'true');
            }

            if (type === 'array' && val) {
              clone[key] = JSON.stringify(val);
            }
          });

        return _.mapKeys(attrs, function (value, key) {
          return _.snakeCase(key);
        });
      },
    },
    {
      find(id, withRelated = []) {
        const model = this.forge({
          id,
        });

        Log.addBreadcrumb({
          category: 'db.find',
          message: `${model.tableName} #${id} ${
            withRelated ? `+ ${withRelated.join(', ')}` : ``
          }`,
          level: 'debug',
        });

        return model.fetch({
          withRelated,
          require: false,
        });
      },

      async findOrCreate(object, withRelated = []) {
        const model = await this.find(object.id, withRelated);

        if (!model) {
          return await this.create(object);
        }

        return model;
      },
    }
  ));
