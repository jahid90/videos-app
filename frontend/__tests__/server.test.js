const createConfig = require('./config');
const createExpressApp = require('./express');

const testEnv = {
    appName: 'Videos App Test',
    enableDebug: false,
    databaseUrl: requireFromEnv('DATABASE_CONNECTION_STRING'),
    messageStoreConnectionString: requireFromEnv(
        'MESSAGE_STORE_CONNECTION_STRING'
    ),
    env: requireFromEnv('NODE_ENV'),
    port: parseInt(requireFromEnv('PORT'), 10),
    cookieSecret: requireFromEnv('COOKIE_SECRET'),
    version: packageJson.version,
};

const config = createConfig({ env });
const app = createExpressApp({ config, env });
