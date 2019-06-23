require('dotenv').config();

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: "./db/db.sqlite"
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'migrations',
    directory: './db/migrations'
  },
  useNullAsDefault: true,
};
