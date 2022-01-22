const createKnexClient = require('./knex-client');
const createHomeApp = require('./app/home');
const createRecordViewingsApp = require('./app/record-viewings');

module.exports = ({ env }) => {
    const db = createKnexClient({
        connectionString: env.databaseUrl,
    });

    const homeApp = createHomeApp({ db });
    const recordViewingsApp = createRecordViewingsApp({ db });

    return {
        db,
        homeApp,
        recordViewingsApp,
    }
}
