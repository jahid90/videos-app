const env = require('../../env');

const AlreadyAttemptedError = require('./already-attempted-error');

const ensureReadNotAlreadyAttempted = (context) => {
    const { subscriberPosition, command } = context;

    if (subscriberPosition.readEventIds.includes(command.metadata.traceId)) {
        throw new AlreadyAttemptedError();
    }

    return context;
};

module.exports = ensureReadNotAlreadyAttempted;
