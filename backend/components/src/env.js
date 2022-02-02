process.env.NODE_ENV === 'development' && require('dotenv').config();

const packageJson = require('../package.json');

const requireFromEnv = (key) => {
    if (!process.env[key]) {
        console.error(`Required environment variable [${key}] not found`);
        process.exit(-1);
    }

    return process.env[key];
};

module.exports = {
    enableDebug: requireFromEnv('ENABLE_DEBUG') === 'true',
    messageStoreConnectionString: requireFromEnv(
        'MESSAGE_STORE_CONNECTION_STRING'
    ),
    emailDirectory: requireFromEnv('EMAIL_DIRECTORY'),
    systemSenderEmailAddress: requireFromEnv('SYSTEM_SENDER_EMAIL_ADDRESS'),
    version: packageJson.version,
};
