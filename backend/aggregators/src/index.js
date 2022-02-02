const env = require('./env');
const createConfig = require('./config');

const config = createConfig({ env });

const start = () => {
    config.aggregators.forEach((a) => a.start());
};

module.exports = {
    config,
    start,
};
