const createPickupTransport = require('nodemailer-pickup-transport');

const createKnexClient = require('./knex-client');
const createPostgresClient = require('./postgres-client');
const createMessageStore = require('./message-store');

const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewings');
const createRegisterUsersApp = require('./app/register-users');
const createAuthenticationApp = require('./app/authenticate');
const createCreatorsPortalApp = require('./app/creators-portal');
const createAdminApp = require('./app/admin');
const createManageUsersApp = require('./app/manage-users');

const createHomePageAggregator = require('./aggregators/home-page');
const createUserCredentialsAggregator = require('./aggregators/user-credentials');
const createCreatorsVideosAggregator = require('./aggregators/creators-videos');
const createVideoOperationsAggregator = require('./aggregators/video-operations');
const createAdminUsersAggregator = require('./aggregators/admin-users');
const createAdminStreamsAggregator = require('./aggregators/admin-streams');
const createAdminCategoriesAggregator = require('./aggregators/admin-categories');
const createAdminSubscriberPositionsAggregator = require('./aggregators/admin-subscriber-positions');
const createAdminEntitiesAggregator = require('./aggregators/admin-entities');

const createIdentityComponent = require('./components/identity');
const createSendEmailComponent = require('./components/send-email');
const createVideoPublishingComponent = require('./components/video-publishing');
const createAdminComponent = require('./components/admin');

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

    const homePageAggregator = createHomePageAggregator({
        db: knexClient,
        messageStore,
    });
    const userCredentialsAggregator = createUserCredentialsAggregator({
        db: knexClient,
        messageStore,
    });
    const creatorsVideosAggregator = createCreatorsVideosAggregator({
        db: knexClient,
        messageStore,
    });
    const videoOperationsAggregator = createVideoOperationsAggregator({
        db: knexClient,
        messageStore,
    });
    const adminUsersAggregator = createAdminUsersAggregator({
        db: knexClient,
        messageStore,
    });
    const adminStreamsAggregator = createAdminStreamsAggregator({
        db: knexClient,
        messageStore,
    });
    const adminCategoriesAggregator = createAdminCategoriesAggregator({
        db: knexClient,
        messageStore,
    });
    const adminSubscriberPositionsAggregator =
        createAdminSubscriberPositionsAggregator({
            db: knexClient,
            messageStore,
        });
    const adminEntitiesAggregator = createAdminEntitiesAggregator({
        db: knexClient,
        messageStore,
    });

    const aggregators = [
        homePageAggregator,
        userCredentialsAggregator,
        creatorsVideosAggregator,
        videoOperationsAggregator,
        adminUsersAggregator,
        adminStreamsAggregator,
        adminCategoriesAggregator,
        adminSubscriberPositionsAggregator,
        adminEntitiesAggregator,
    ];

    const identityComponent = createIdentityComponent({ messageStore });
    const sendEmailComponent = createSendEmailComponent({
        messageStore,
        systemSenderEmailAddress: env.systemSenderEmailAddress,
        transport,
    });
    const videoPublishingComponent = createVideoPublishingComponent({
        messageStore,
    });
    const adminComponent = createAdminComponent({ messageStore });

    const components = [
        identityComponent,
        sendEmailComponent,
        videoPublishingComponent,
        // adminComponent, // TODO: Debug Idempotency Issue
    ];

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
        aggregators,
        components,
    };
};

module.exports = createConfig;
