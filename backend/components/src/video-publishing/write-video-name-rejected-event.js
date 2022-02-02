const { v4: uuid } = require('uuid');

const writeVideoNameRejectedEvent = (context, err) => {
    const { command, messageStore } = context;

    const videoNameRejectedEvent = {
        id: uuid(),
        type: 'VideoNameRejected',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            name: command.data.name,
            reason: err.message,
        },
    };
    const streamName = `videoPublishing-${command.data.videoId}`;

    return messageStore
        .write(streamName, videoNameRejectedEvent)
        .then(() => context);
};

module.exports = writeVideoNameRejectedEvent;
