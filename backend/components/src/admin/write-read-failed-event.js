const { v4: uuid } = require('uuid');

const writeReadEvent = (context, err) => {
    const { command, messageStore } = context;

    const event = {
        id: uuid(),
        type: 'ReadFailed',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            position: command.data.position,
            lastMessageId: command.data.lastMessageId,
            reason: err.message,
        },
    };
    const streamName = `subscriberPosition-${command.data.subscriberId}`;

    return messageStore.write(streamName, event);
};

module.exports = writeReadEvent;
