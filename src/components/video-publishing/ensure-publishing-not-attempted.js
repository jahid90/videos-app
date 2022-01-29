const AlreadyPublishedError = require('./already-published-error');

const ensurePublishingNotAttempted = (context) => {
    const { video } = context;

    if (video.publishingAttempted) {
        throw new AlreadyPublishedError();
    }

    return context;
};

module.exports = ensurePublishingNotAttempted;
