const Bluebird = require('bluebird');

const AlreadyRegisteredError = require('./already-registered-error');
const loadIdentity = require('./load-entity');
const ensureNotRegistered = require('./ensure-not-registered');
const writeRegisteredEvent = require('./write-registered-event');

const createIdentityCommandHandlers = ({ messageStore }) => {
    return {
        Register: (command) => {
            const context = {
                messageStore,
                command,
                identityId: command.data.userId,
            };

            return Bluebird.resolve(context)
                .then(loadIdentity)
                .then(ensureNotRegistered)
                .then(writeRegisteredEvent)
                .catch(AlreadyRegisteredError, () => {});
        },
    };
};

const build = ({ messageStore }) => {
    const identityCommandHandlers = createIdentityCommandHandlers({
        messageStore,
    });
    const identityCommandSubscription = messageStore.createSubscription({
        streamName: 'identity:command',
        handlers: identityCommandHandlers,
        subscriberId: 'components:identity:command',
    });

    const start = () => {
        identityCommandSubscription.start();
    };

    return {
        identityCommandHandlers,
        start,
    };
};

module.exports = build;
