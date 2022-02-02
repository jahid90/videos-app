const FAKE_TRANSCODING_DESTINATION =
    'https://videos.jahiduls.io/watch?v=GI_P3UtZXAA';

const transcodeVideo = (context) => {
    const { video } = context;
    video.transcodedUri = FAKE_TRANSCODING_DESTINATION;

    return context;
};

module.exports = transcodeVideo;
