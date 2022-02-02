const { v4: uuid } = require('uuid');

const writeVideoDescriptionRejectedEvent = (context, err) => {
    const { command, messageStore } = context;

    const videoDescriptionRejectedEvent = {
        id: uuid(),
        type: 'VideoDescriptionRejected',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            description: command.data.description,
            reason: err.message,
        },
    };
    const streamName = `videoPublishing-${command.data.videoId}`;

    return messageStore
        .write(streamName, videoDescriptionRejectedEvent)
        .then(() => context);
};

module.exports = writeVideoDescriptionRejectedEvent;
