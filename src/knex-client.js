const Bluebird = require('bluebird');
const knex = require('knex');

module.exports = ({ connectionString, migrationsTableName }) => {

    const client = knex(connectionString);
    const migrationOptions = {
        tableName: migrationsTableName || 'knex_migrations',
    }

    return Bluebird.resolve(client.migrate.latest(migrationOptions))
        .then(() => client);

}
