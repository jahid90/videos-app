const { v4: uuid } = require('uuid');

const writePositionResetEvent = (context) => {
    const { command, messageStore } = context;

    const event = {
        id: uuid(),
        type: 'PositionReset',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
            subscriberId: command.data.subscriberId,
        },
        data: {
            position: 0,
            lastMessageId: null,
        },
    };
    const streamName = `subscriberPosition-${command.data.subscriberId}`;

    return messageStore.write(streamName, event);
};

module.exports = writePositionResetEvent;
