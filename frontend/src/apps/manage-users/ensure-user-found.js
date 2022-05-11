const NotFoundError = require('../../errors/not-found-error');

const ensureUserFound = (context) => {
    if (!context.user) {
        throw new NotFoundError();
    }

    return context;
};

module.exports = ensureUserFound;
