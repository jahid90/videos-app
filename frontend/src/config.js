const createKnexClient = require('./knex-client');
const createPostgresClient = require('./postgres-client');
const createMessageStore = require('@jahid90/lib-message-store');

const createHomeApp = require('./apps/home');
const createRecordViewingsApp = require('./apps/record-viewings');
const createRegisterUsersApp = require('./apps/register-users');
const createAuthenticationApp = require('./apps/authenticate');
const createCreatorsPortalApp = require('./apps/creators-portal');
const createAdminApp = require('./apps/admin');
const createManageUsersApp = require('./apps/manage-users');

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
