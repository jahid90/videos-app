const createPickupTransport = require('nodemailer-pickup-transport');
const createMessageStore = require('@jahid90/message-store');

const createKnexClient = require('./knex-client');
const createPostgresClient = require('./postgres-client');

const createIdentityComponent = require('./identity');
const createSendEmailComponent = require('./send-email');
const createVideoPublishingComponent = require('./video-publishing');
const createAdminComponent = require('./admin');

const createConfig = ({ env }) => {
    const postgresClient = createPostgresClient({
        connectionString: env.messageStoreConnectionString,
    });
    const messageStore = createMessageStore({ db: postgresClient });
    const transport = createPickupTransport({ directory: env.emailDirectory });

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
        adminComponent,
    ];

    return {
        messageStore,
        components,
    };
};

module.exports = createConfig;
