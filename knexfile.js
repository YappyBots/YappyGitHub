require('dotenv').config();

module.exports = {
  client: 'better-sqlite3',
  connection: {
    filename: "./db/db.sqlite"
  },
  pool: {
    min: 2,
    max: 10,
    afterCreate: (db, done) => {
      // db is a better-sqlite3 Database instance
      db();
    }
  },
  migrations: {
    tableName: 'migrations',
    directory: './db/migrations'
  },
  useNullAsDefault: true,
};
