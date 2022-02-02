const createKnexClient = require('./knex-client');
const createPostgresClient = require('./postgres-client');
const createMessageStore = require('@jahid90/message-store');

const createHomePageAggregator = require('./pages/home-page');
const createUserCredentialsAggregator = require('./users/user-credentials');
const createCreatorsVideosAggregator = require('./videos/creators-videos');
const createVideoOperationsAggregator = require('./videos/video-operations');
const createAdminUsersAggregator = require('./admin/admin-users');
const createAdminStreamsAggregator = require('./admin/admin-streams');
const createAdminCategoriesAggregator = require('./admin/admin-categories');
const createAdminSubscriberPositionsAggregator = require('./admin/admin-subscriber-positions');
const createAdminEventTypesAggregator = require('./admin/admin-event-types');
const createAdminEntitiesAggregator = require('./admin/admin-entities');

const createConfig = ({ env }) => {
    const knexClient = createKnexClient({ connectionString: env.databaseUrl });
    const postgresClient = createPostgresClient({
        connectionString: env.messageStoreConnectionString,
    });
    const messageStore = createMessageStore({ db: postgresClient });

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
    const adminEventTypesAggregator = createAdminEventTypesAggregator({
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
        adminEventTypesAggregator,
    ];

    return {
        knexClient,
        messageStore,
        aggregators,
    };
};

module.exports = createConfig;
