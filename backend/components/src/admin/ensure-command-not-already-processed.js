const env = require('../env');

const CommandAlreadyProcessedError = require('./command-already-processed-error');

const ensureCommandNotAlreadyProcessed = (context) => {
    const { subscriberPosition, command } = context;

    if (subscriberPosition.sequence > command.globalPosition) {
        throw new CommandAlreadyProcessedError();
    }

    return context;
};

module.exports = ensureCommandNotAlreadyProcessed;
