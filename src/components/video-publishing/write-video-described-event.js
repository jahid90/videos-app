const { v4: uuid } = require('uuid');

const writeVideoDescribedEvent = (context) => {
    const { command, messageStore } = context;

    const videoDescribedEvent = {
        id: uuid(),
        type: 'VideoDescribed',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            description: command.data.description,
        },
    };
    const streamName = `videoPublishing-${command.data.videoId}`;

    return messageStore
        .write(streamName, videoDescribedEvent)
        .then(() => context);
};

module.exports = writeVideoDescribedEvent;
