const { v4: uuid } = require('uuid');

const writePositionResetFailedEvent = (context, err) => {
    const { command, messageStore } = context;

    const event = {
        id: uuid(),
        type: 'PositionResetFailed',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            position: 0,
            lastMessageId: null,
            reason: err.message,
        },
    };
    const streamName = `subscriberPosition-${command.data.subscriberId}`;

    return messageStore.write(streamName, event);
};

module.exports = writePositionResetFailedEvent;
