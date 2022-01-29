const Bluebird = require('bluebird');

const AlreadyPublishedError = require('./already-published-error');

const loadVideo = require('./load-video');
const ensurePublishingNotAttempted = require('./ensure-publishing-not-attempted');
const transcodeVideo = require('./transcode-video');
const writeVideoPublishedEvent = require('./write-video-published-event');
const writeVideoPublishingFailedEvent = require('./write-video-publishing-failed-event');

const createHandlers = ({ messageStore }) => {
    return {
        PublishVideo: (command) => {
            const context = {
                command,
                messageStore,
            };

            return Bluebird.resolve(context)
                .then(loadVideo)
                .then(ensurePublishingNotAttempted)
                .then(transcodeVideo)
                .then(writeVideoPublishedEvent)
                .catch(AlreadyPublishedError, () => {})
                .catch((err) => writeVideoPublishingFailedEvent(context, err));
        },
    };
};

const build = ({ messageStore }) => {
    const handlers = createHandlers({ messageStore });
    const subscription = messageStore.createSubscription({
        streamName: 'videoPublishing:command',
        handlers,
        subscriberId: 'components:video-publishing',
    });

    const start = () => {
        return subscription.start();
    };

    return {
        handlers,
        start,
    };
};

module.exports = build;
