const { v4: uuid } = require('uuid');

const writeVideoNamedEvent = (context) => {
    const { command, messageStore } = context;

    const videoNamedEvent = {
        id: uuid(),
        type: 'VideoNamed',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            name: command.data.name,
        },
    };
    const streamName = `videoPublishing-${command.data.videoId}`;

    return messageStore.write(streamName, videoNamedEvent).then(() => context);
};

module.exports = writeVideoNamedEvent;
