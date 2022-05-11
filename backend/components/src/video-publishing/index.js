const Bluebird = require('bluebird');

const env = require('../env');
const AlreadyPublishedError = require('./already-published-error');
const CommandAlreadyProcessedError = require('./command-already-processed-error');
const ValidationError = require('./validation-error');

const loadVideo = require('./load-video');
const ensurePublishingNotAttempted = require('./ensure-publishing-not-attempted');
const transcodeVideo = require('./transcode-video');
const writeVideoPublishedEvent = require('./write-video-published-event');
const writeVideoPublishingFailedEvent = require('./write-video-publishing-failed-event');
const ensureCommandHasNotBeenProcessed = require('./ensure-command-has-not-been-processed');
const ensureNameIsValid = require('./ensure-name-is-valid');
const writeVideoNamedEvent = require('./write-video-named-event');
const writeVideoNameRejectedEvent = require('./write-video-name-rejected-event');
const ensureDescriptionIsValid = require('./ensure-description-is-valid');
const writeVideoDescribedEvent = require('./write-video-described-event');
const writeVideoDescriptionRejectedEvent = require('./write-video-description-rejected-event');

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
                .catch(AlreadyPublishedError, () => {
                    env.enableDebug &&
                        console.debug(
                            `[${command.streamName}] skipping command: ${command.globalPosition}`
                        );
                })
                .catch((err) => writeVideoPublishingFailedEvent(context, err));
        },
        NameVideo: (command) => {
            const context = {
                command,
                messageStore,
            };

            return Bluebird.resolve(context)
                .then(loadVideo)
                .then(ensureCommandHasNotBeenProcessed)
                .then(ensureNameIsValid)
                .then(writeVideoNamedEvent)
                .catch(CommandAlreadyProcessedError, () => {
                    env.enableDebug &&
                        console.debug(
                            `[${command.streamName}] skipping command: ${command.globalPosition}`
                        );
                })
                .catch(ValidationError, (err) =>
                    writeVideoNameRejectedEvent(context, err)
                );
        },
        DescribeVideo: (command) => {
            const context = {
                command,
                messageStore,
            };

            return Bluebird.resolve(context)
                .then(loadVideo)
                .then(ensureCommandHasNotBeenProcessed)
                .then(ensureDescriptionIsValid)
                .then(writeVideoDescribedEvent)
                .catch(CommandAlreadyProcessedError, () => {
                    env.enableDebug &&
                        console.debug(
                            `[${command.streamName}] skipping command: ${command.globalPosition}`
                        );
                })
                .catch(ValidationError, (err) =>
                    writeVideoDescriptionRejectedEvent(context, err)
                );
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
        start,
    };
};

module.exports = build;
