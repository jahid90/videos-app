const createKnexClient = require('./knex-client');
const createPostgresClient = require('./postgres-client');
const createMessageStore = require('./message-store');

const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewings');
const createRegisterUsersApp = require('./app/register-users');

const createHomePageAggregator = require('./aggregators/home-page');

const createIdentityComponent = require('./components/identity');

const createConfig = ({ env }) => {
    const knexClient = createKnexClient({ connectionString: env.databaseUrl });
    const postgresClient = createPostgresClient({
        connectionString: env.messageStoreConnectionString,
    });
    const messageStore = createMessageStore({ db: postgresClient });

    const homeApp = createHomeApp({ db: knexClient });
    const recordViewingsApp = createRecordViewingsApp({ messageStore });
    const registerUsersApp = createRegisterUsersApp({
        db: knexClient,
        messageStore,
    });

    const homePageAggregator = createHomePageAggregator({
        db: knexClient,
        messageStore,
    });

    const aggregators = [homePageAggregator];

    const identityComponent = createIdentityComponent({ messageStore });

    const components = [identityComponent];

    return {
        knexClient,
        messageStore,
        homeApp,
        recordViewingsApp,
        registerUsersApp,
        aggregators,
        components,
    };
};

module.exports = createConfig;