const loadVideo = (context) => {
    const { queries, userId, videoId } = context;

    return queries.videoByIdAndUserId(videoId, userId).then((video) => {
        context.video = video;
        return context;
    });
};

module.exports = loadVideo;
