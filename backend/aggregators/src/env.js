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
    databaseUrl: requireFromEnv('DATABASE_CONNECTION_STRING'),
    messageStoreConnectionString: requireFromEnv(
        'MESSAGE_STORE_CONNECTION_STRING'
    ),
    env: requireFromEnv('NODE_ENV'),
    version: packageJson.version,
};
