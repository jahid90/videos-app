const videoPublishingProjection = {
    $init: () => {
        return {
            id: null,
            publishingAttempted: false,
            ownerId: null,
            sourceUri: null,
            transcodedUri: null,
            sequence: 0,
            name: '',
        };
    },
    VideoPublished: (video, videoPublished) => {
        video.id = videoPublished.data.videoId;
        video.publishingAttempted = true;
        video.ownerId = videoPublished.data.ownerId;
        video.sourceUri = videoPublished.data.sourceUri;
        video.transcodedUri = videoPublished.data.transcodedUri;
        video.sequence = videoPublished.globalPosition;

        return video;
    },
    VideoPublishingFailed: (video, videoPublishingFailed) => {
        video.id = videoPublishingFailed.data.videoId;
        video.publishingAttempted = true;
        video.ownerId = videoPublishingFailed.data.ownerId;
        video.sourceUri = videoPublishingFailed.data.sourceUri;
        video.sequence = videoPublishingFailed.globalPosition;

        return video;
    },
    VideoNamed: (video, videoNamed) => {
        video.sequence = videoNamed.globalPosition;
        video.name = videoNamed.data.name;

        return video;
    },
    VideoNameRejected: (video, videoNameRejected) => {
        video.sequence = videoNameRejected.globalPosition;

        return video;
    },
};

module.exports = videoPublishingProjection;
