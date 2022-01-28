const Bluebird = require('bluebird');

const AlreadyRegisteredError = require('./already-registered-error');
const AlreadyLockedError = require('./already-locked-error');
const AlreadySentRegistrationEmailError = require('./already-sent-registration-email-error');

const loadIdentity = require('./load-identity');
const ensureNotRegistered = require('./ensure-not-registered');
const writeRegisteredEvent = require('./write-registered-event');
const writeAccountLockedEvent = require('./write-account-locked-event');
const ensureRegistrationEmailNotSent = require('./ensure-registration-email-not-sent');
const renderRegistrationEmail = require('./render-registration-email');
const writeSendCommand = require('./write-send-command');
const writeRegistrationEmailSentEvent = require('./write-registration-email-sent-event');

const createIdentityEventHandlers = ({ messageStore }) => {
    return {
        Registered: (event) => {
            const context = {
                messageStore,
                event,
                identityId: event.data.userId,
            };

            return Bluebird.resolve(context)
                .then(loadIdentity)
                .then(ensureRegistrationEmailNotSent)
                .then(renderRegistrationEmail)
                .then(writeSendCommand)
                .catch(AlreadySentRegistrationEmailError, () => {});
        },
    };
};

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
        LockAccount: (command) => {
            const context = {
                messageStore,
                command,
                identityId: command.data.userId,
            };

            return Bluebird.resolve(context)
                .then(loadIdentity)
                .then(writeAccountLockedEvent)
                .catch(AlreadyLockedError, () => {});
        },
    };
};

const streamNameToId = (streamName) => {
    return streamName.split(/-(.+)/)[1];
};

const createSendEmailEventHandlers = ({ messageStore }) => {
    return {
        Sent: (event) => {
            const originStreamName = event.metadata.originStreamName;
            const identityId = streamNameToId(originStreamName);

            const context = {
                messageStore,
                event,
                identityId,
            };

            return Bluebird.resolve(context)
                .then(loadIdentity)
                .then(ensureRegistrationEmailNotSent)
                .then(writeRegistrationEmailSentEvent)
                .catch(AlreadySentRegistrationEmailError, () => {});
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

    const identityEventHandlers = createIdentityEventHandlers({ messageStore });
    const identityEventSubsccription = messageStore.createSubscription({
        streamName: 'identity',
        handlers: identityEventHandlers,
        subscriberId: 'components:identity',
    });

    const sendEmailEventHandlers = createSendEmailEventHandlers({
        messageStore,
    });
    const sendEmailEventSubscription = messageStore.createSubscription({
        streamName: 'sendEmail',
        handlers: sendEmailEventHandlers,
        originStreamName: 'identity',
        subscriberId: 'components:identity:sendEmailEvents',
    });

    const start = () => {
        identityCommandSubscription.start();
        identityEventSubsccription.start();
        sendEmailEventSubscription.start();
    };

    return {
        identityCommandHandlers,
        identityEventHandlers,
        sendEmailEventHandlers,
        start,
    };
};

module.exports = build;
