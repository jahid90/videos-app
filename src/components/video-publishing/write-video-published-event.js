const { v4: uuid } = require('uuid');

const writeVideoPublishedEvent = (context) => {
    const { messageStore, command, video } = context;

    const event = {
        id: uuid(),
        type: 'VideoPublished',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            ownerId: command.data.ownerId,
            sourceUri: command.data.sourceUri,
            transcodedUri: video.transcodedUri,
            videoId: command.data.videoId,
        },
    };
    const streamName = `videoPublishing-${command.data.videoId}`;

    return messageStore.write(streamName, event).then(() => context);
};

module.exports = writeVideoPublishedEvent;
