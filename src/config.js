const createKnexClient = require('./knex-client');
const createPostgresClient = require('./postgres-client');
const createMessageStore = require('./message-store');
const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewings');

const createConfig = ({ env }) => {

    const knexClient = createKnexClient({ connectionString: env.databaseUrl });
    const postgresClient = createPostgresClient({ connectionString: env.messageStoreConnectionString });
    const messageStore = createMessageStore({ db: postgresClient });

    const homeApp = createHomeApp({ db: knexClient });
    const recordViewingsApp = createRecordViewingsApp({ messageStore });

    return {
        knexClient,
        messageStore,
        homeApp,
        recordViewingsApp,
    }
}

module.exports = createConfig;
