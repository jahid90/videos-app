const AlreadyAttemptedError = require('./already-attempted-error');

const ensureResetNotAlreadyAttempted = (context) => {
    const { subscriberPosition, command } = context;

    if (subscriberPosition.resetEventIds.includes(command.metadata.traceId)) {
        throw new AlreadyAttemptedError();
    }

    return context;
};

module.exports = ensureResetNotAlreadyAttempted;
