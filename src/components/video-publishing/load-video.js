const videoPublishingProjection = require('./video-publishing-projection.js');

const loadVideo = (context) => {
    const messageStore = context.messageStore;
    const command = context.command;
    const videoStreamName = `videoPublishing-${command.data.videoId}`;

    return messageStore
        .fetch(videoStreamName, videoPublishingProjection)
        .then((video) => {
            context.video = video;
            return context;
        });
};

module.exports = loadVideo;
