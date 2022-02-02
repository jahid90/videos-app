const { v4: uuid } = require('uuid');

const writeReadEvent = (context) => {
    const { command, messageStore } = context;

    const event = {
        id: uuid(),
        type: 'Read',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            position: command.data.position,
            lastMessageId: command.data.lastMessageId,
        },
    };
    const streamName = `subscriberPosition-${command.metadata.subscriberId}`;

    return messageStore.write(streamName, event);
};

module.exports = writeReadEvent;
