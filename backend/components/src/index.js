const createConfig = require('./config');
const env = require('./env');

const config = createConfig({ env });

const start = () => {
    config.components.forEach((s) => s.start());
};

module.exports = {
    start,
};
