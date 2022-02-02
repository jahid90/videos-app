const createKnexClient = require('./knex-client');
const createPostgresClient = require('./postgres-client');
const createMessageStore = require('@jahid90/message-store');

const createHomeApp = require('./home');
const createRecordViewingsApp = require('./record-viewings');
const createRegisterUsersApp = require('./register-users');
const createAuthenticationApp = require('./authenticate');
const createCreatorsPortalApp = require('./creators-portal');
const createAdminApp = require('./admin');
const createManageUsersApp = require('./manage-users');

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
    const authenticationApp = createAuthenticationApp({
        db: knexClient,
        messageStore,
    });
    const creatorsPortalApp = createCreatorsPortalApp({
        db: knexClient,
        messageStore,
    });
    const adminApp = createAdminApp({
        db: knexClient,
        messageStoreDb: postgresClient,
        messageStore,
    });
    const manageUsersApp = createManageUsersApp({
        db: knexClient,
        messageStore,
    });

    return {
        knexClient,
        messageStore,
        homeApp,
        recordViewingsApp,
        registerUsersApp,
        authenticationApp,
        creatorsPortalApp,
        adminApp,
        manageUsersApp,
    };
};

module.exports = createConfig;
