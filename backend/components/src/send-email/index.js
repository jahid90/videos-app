const Bluebird = require('bluebird');

const env = require('../env');
const AlreadySentError = require('./already-sent-error');
const SendError = require('./send-error');

const createSend = require('./send');
const loadEmail = require('./load-email');
const ensureEmailHasNotBeenSent = require('./ensure-email-has-not-been-sent');
const sendEmail = require('./send-email');
const writeSentEvent = require('./write-sent-event');
const writeFailedEvent = require('./write-failed-event');

const createHandlers = ({
    messageStore,
    justSendIt,
    systemSenderEmailAddress,
}) => {
    return {
        Send: (command) => {
            const context = {
                messageStore,
                justSendIt,
                systemSenderEmailAddress,
                sendCommand: command,
            };

            return Bluebird.resolve(context)
                .then(loadEmail)
                .then(ensureEmailHasNotBeenSent)
                .then(sendEmail)
                .then(writeSentEvent)
                .catch(AlreadySentError, () => {
                    env.enableDebug &&
                        console.debug(
                            `[${command.streamName}] skipping command: ${command.globalPosition}`
                        );
                })
                .catch(SendError, (err) => writeFailedEvent(context, err));
        },
    };
};

const build = ({ messageStore, systemSenderEmailAddress, transport }) => {
    const justSendIt = createSend({ transport });
    const handlers = createHandlers({
        messageStore,
        justSendIt,
        systemSenderEmailAddress,
    });
    const subscription = messageStore.createSubscription({
        streamName: 'sendEmail:command',
        handlers,
        subscriberId: 'components:send-email',
    });

    const start = () => {
        subscription.start();
    };

    return {
        start,
    };
};

module.exports = build;
