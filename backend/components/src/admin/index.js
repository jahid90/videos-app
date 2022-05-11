const Bluebird = require('bluebird');

const env = require('../env');
const CommandAlreadyProcessedError = require('./command-already-processed-error');

const loadSubscriberPosition = require('./load-subscriber-position');
const ensureCommandNotAlreadyProcessed = require('./ensure-command-not-already-processed');
const writeReadEvent = require('./write-read-event');
const writeReadFailedEvent = require('./write-read-failed-event');
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
                .then(ensureCommandNotAlreadyProcessed)
                .then(writeReadEvent)
                .catch(CommandAlreadyProcessedError, () => {
                    env.enableDebug &&
                        console.debug(
                            `[${command.streamName}] skipping command: ${command.globalPosition}`
                        );
                })
                .catch((err) => writeReadFailedEvent(context, err));
        },
        // TODO : Fix Idempotency Issue
        // ResetPosition: (command) => {
        //     const context = {
        //         command,
        //         messageStore,
        //     };

        //     return Bluebird.resolve(context)
        //         .then(loadSubscriberPosition)
        //         .then(ensureCommandNotAlreadyProcessed)
        //         .then(writePositionResetEvent)
        //         .catch(CommandAlreadyProcessedError, () => {
        //             env.enableDebug &&
        //                 console.debug(
        //                     `[${command.streamName}] skipping command: ${command.globalPosition}`
        //                 );
        //         })
        //         .catch((err) => writePositionResetFailedEvent(context, err));
        // },
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
        start,
    };
};

module.exports = build;
