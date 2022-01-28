const createPickupTransport = require('nodemailer-pickup-transport');

const createKnexClient = require('./knex-client');
const createPostgresClient = require('./postgres-client');
const createMessageStore = require('./message-store');

const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewings');
const createRegisterUsersApp = require('./app/register-users');
const createAuthenticationApp = require('./app/authenticate');

const createHomePageAggregator = require('./aggregators/home-page');
const createUserCredentialsAggregator = require('./aggregators/user-credentials');

const createIdentityComponent = require('./components/identity');
const createSendEmailComponent = require('./components/send-email');

const createConfig = ({ env }) => {
    const knexClient = createKnexClient({ connectionString: env.databaseUrl });
    const postgresClient = createPostgresClient({
        connectionString: env.messageStoreConnectionString,
    });
    const messageStore = createMessageStore({ db: postgresClient });
    const transport = createPickupTransport({ directory: env.emailDirectory });

    const homeApp = createHomeApp({ db: knexClient });
    const recordViewingsApp = createRecordViewingsApp({ messageStore });
    const registerUsersApp = createRegisterUsersApp({
        db: knexClient,
        messageStore,
    });
    const authenticateApp = createAuthenticationApp({
        db: knexClient,
        messageStore,
    });

    const homePageAggregator = createHomePageAggregator({
        db: knexClient,
        messageStore,
    });
    const userCredentialsAggregator = createUserCredentialsAggregator({
        db: knexClient,
        messageStore,
    });

    const aggregators = [homePageAggregator, userCredentialsAggregator];

    const identityComponent = createIdentityComponent({ messageStore });
    const sendEmailComponent = createSendEmailComponent({
        messageStore,
        systemSenderEmailAddress: env.systemSenderEmailAddress,
        transport,
    });

    const components = [identityComponent, sendEmailComponent];

    return {
        knexClient,
        messageStore,
        homeApp,
        recordViewingsApp,
        registerUsersApp,
        authenticateApp,
        aggregators,
        components,
    };
};

module.exports = createConfig;
