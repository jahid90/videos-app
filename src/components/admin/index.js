const Bluebird = require('bluebird');

const env = require('../../env');
const AlreadyAttemptedError = require('./already-attempted-error');

const loadSubscriberPosition = require('./load-subscriber-position');
const ensureReadNotAlreadyAttempted = require('./ensure-read-not-already-attempted');
const writeReadEvent = require('./write-read-event');
const writeReadFailedEvent = require('./write-read-failed-event');
const ensureResetNotAlreadyAttempted = require('./ensure-reset-not-already-attempted');
const writePositionResetEvent = require('./write-position-reset-event');
const writePositionResetFailedEvent = require('./write-position-reset-failed-event');

const createHandlers = ({ messageStore }) => {
    return {
        Read: (command) => {
            const context = {
                command,
                messageStore,
            };

            return Bluebird.resolve(context)
                .then(loadSubscriberPosition)
                .then(ensureReadNotAlreadyAttempted)
                .then(writeReadEvent)
                .catch(AlreadyAttemptedError, () => {
                    env.enableDebug &&
                        console.debug(
                            `[${command.streamName}] skipping command: ${command.globalPosition}`
                        );
                })
                .catch((err) => writeReadFailedEvent(context, err));
        },
        ResetPosition: (command) => {
            const context = {
                command,
                messageStore,
            };

            return Bluebird.resolve(context)
                .then(loadSubscriberPosition)
                .then(ensureResetNotAlreadyAttempted)
                .then(writePositionResetEvent)
                .catch(AlreadyAttemptedError, () => {
                    env.enableDebug &&
                        console.debug(
                            `[${command.streamName}] skipping command: ${command.globalPosition}`
                        );
                })
                .catch((err) => writePositionResetFailedEvent(context, err));
        },
    };
};

const build = ({ messageStore }) => {
    const handlers = createHandlers({ messageStore });
    const subscription = messageStore.createSubscription({
        streamName: 'subscriberPosition:command',
        handlers,
        subscriberId: 'components:admin',
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
