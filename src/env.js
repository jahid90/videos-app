require('dotenv').config();

const packageJson = require('../package.json');

const requireFromEnv = (key) => {
    if (!process.env[key]) {
        console.error(`Required environment variable [${key}] not found`);
        process.exit(-1);
    }

    return process.env[key];
};

module.exports = {
    appName: requireFromEnv('APP_NAME'),
    databaseUrl: requireFromEnv('DATABASE_CONNECTION_STRING'),
    messageStoreConnectionString: requireFromEnv(
        'MESSAGE_STORE_CONNECTION_STRING'
    ),
    env: requireFromEnv('NODE_ENV'),
    port: parseInt(requireFromEnv('PORT'), 10),
    cookieSecret: requireFromEnv('COOKIE_SECRET'),
    emailDirectory: requireFromEnv('EMAIL_DIRECTORY'),
    systemSenderEmailAddress: requireFromEnv('SYSTEM_SENDER_EMAIL_ADDRESS'),
    version: packageJson.version,
};
