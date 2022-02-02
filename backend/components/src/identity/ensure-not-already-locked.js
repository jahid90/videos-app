const AlreadyLockedError = require('./already-locked-error');

const ensureNotAlreadyLocked = (context) => {
    if (context.identity.isLocked) {
        throw new AlreadyLockedError();
    }

    return context;
};

module.exports = ensureNotAlreadyLocked;
