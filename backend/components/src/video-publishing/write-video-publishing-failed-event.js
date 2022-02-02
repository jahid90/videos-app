const { v4: uuid } = require('uuid');

const writeVideoPublishingFailedEvent = (context, err) => {
    const { command, messageStore } = context;

    const transcodingFailedEvent = {
        id: uuid(),
        type: 'VideoPublishingFailed',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            ownerId: command.data.ownerId,
            sourceUri: command.data.sourceUri,
            videoId: command.data.videoId,
            reason: err.message,
        },
    };
    const streamName = `videoPublishing-${command.data.videoId}`;

    return messageStore
        .write(streamName, transcodingFailedEvent)
        .then(() => context);
};

module.exports = writeVideoPublishingFailedEvent;
