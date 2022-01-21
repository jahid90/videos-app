const packageJson = require('../../package.json');

const requireFromEnv = (envVar) => {
    if (!process.env[envVar]) {
        console.error(`Required environment variable [${envVar}] not found`);
        process.exit(-1);
    }

    return process.env[envVar];
}

module.exports = {
    appName: requireFromEnv('APP_NAME'),
    env: requireFromEnv('NODE_ENV'),
    port: parseInt(requireFromEnv('PORT'), 10),
    version: packageJson.version,
}
