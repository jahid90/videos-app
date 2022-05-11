const bodyParser = require('body-parser');
const camelCaseKeys = require('camelcase-keys');
const express = require('express');
const { v4: uuid } = require('uuid');

const createActions = ({ messageStore, queries }) => {
    const publishVideo = (context, videoId, sourceUri) => {
        const publishVideoCommand = {
            id: uuid(),
            type: 'PublishVideo',
            metadata: {
                traceId: context.traceId,
                userId: context.userId,
            },
            data: {
                ownerId: context.userId,
                sourceUri,
                videoId,
            },
        };
        const streamName = `videoPublishing:command-${videoId}`;

        return messageStore.write(streamName, publishVideoCommand);
    };

    const nameVideo = (context, videoId, name) => {
        const nameVideoCommand = {
            id: uuid(),
            type: 'NameVideo',
            metadata: {
                traceId: context.traceId,
                userId: context.userId,
            },
            data: {
                name,
                videoId,
            },
        };
        const streamName = `videoPublishing:command-${videoId}`;

        return messageStore.write(streamName, nameVideoCommand);
    };

    const describeVideo = (context, videoId, description) => {
        const describeVideoCommand = {
            id: uuid(),
            type: 'DescribeVideo',
            metadata: {
                traceId: context.traceId,
                userId: context.userId,
            },
            data: {
                description,
                videoId,
            },
        };
        const streamName = `videoPublishing:command-${videoId}`;

        return messageStore.write(streamName, describeVideoCommand);
    };

    return {
        publishVideo,
        nameVideo,
        describeVideo,
    };
};

const createHandlers = ({ actions, queries }) => {
    const handlePublishVideo = (req, res, next) => {
        return actions
            .publishVideo(req.context, req.body.videoId, req.body.url)
            .then(() => res.json('"ok"'))
            .catch(next);
    };

    const handleDashboard = (req, res, next) => {
        return queries
            .videosByOwnerId(req.context.userId)
            .then((videos) => {
                const newVideoId = uuid();
                const renderContext = { newVideoId, videos };

                res.render(
                    'apps/creators-portal/templates/dashboard',
                    renderContext
                );
            })
            .catch(next);
    };

    const handleNameVideo = (req, res, next) => {
        const videoId = req.params.id;
        const name = req.body.name;

        actions
            .nameVideo(req.context, videoId, name)
            .then(() =>
                res.redirect(
                    `/creators-portal/video-operations/${req.context.traceId}`
                )
            )
            .catch(next);
    };

    const handleDescribeVideo = (req, res, next) => {
        const videoId = req.params.id;
        const description = req.body.description;

        actions
            .describeVideo(req.context, videoId, description)
            .then(() =>
                res.redirect(
                    `/creators-portal/video-operations/${req.context.traceId}`
                )
            )
            .catch(next);
    };

    const handleShowVideo = (req, res, next) => {
        const videoId = req.params.id;
        const ownerId = req.context.userId;

        return queries
            .videoByIdAndOwnerId(videoId, ownerId)
            .then((video) => {
                const template = video
                    ? 'apps/creators-portal/templates/video'
                    : 'common-templates/404';

                return res.render(template, { video });
            })
            .catch(next);
    };

    const handleShowVideoOperation = (req, res, next) => {
        return queries
            .videoOperationByTraceId(req.params.traceId)
            .then((operation) => {
                if (!operation || !operation.succeeded) {
                    return res.render(
                        'apps/creators-portal/templates/video-operation',
                        { operation }
                    );
                }

                return res.redirect(
                    `/creators-portal/videos/${operation.videoId}`
                );
            });
    };

    return {
        handlePublishVideo,
        handleDashboard,
        handleShowVideo,
        handleNameVideo,
        handleDescribeVideo,
        handleShowVideoOperation,
    };
};

const createQueries = ({ db }) => {
    const videosByOwnerId = (ownerId) => {
        return db
            .then((client) =>
                client('creators_portal_videos').where({ owner_id: ownerId })
            )
            .then(camelCaseKeys);
    };

    const videoByIdAndOwnerId = (id, ownerId) => {
        const queryParams = {
            id,
            owner_id: ownerId,
        };

        return db
            .then((client) =>
                client('creators_portal_videos').where(queryParams).limit(1)
            )
            .then(camelCaseKeys)
            .then((rows) => rows[0]);
    };

    const videoOperationByTraceId = (traceId) => {
        return db
            .then((client) =>
                client('video_operations').where({ trace_id: traceId }).limit(1)
            )
            .then(camelCaseKeys)
            .then((rows) => rows[0]);
    };

    return { videosByOwnerId, videoByIdAndOwnerId, videoOperationByTraceId };
};

const createCreatorsPortal = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const actions = createActions({ messageStore, queries });
    const handlers = createHandlers({ actions, queries });

    const router = express.Router();

    router
        .route('/videos/:id/name')
        .post(
            bodyParser.urlencoded({ extended: false }),
            handlers.handleNameVideo
        );
    router
        .route('/videos/:id/describe')
        .post(
            bodyParser.urlencoded({ extended: false }),
            handlers.handleDescribeVideo
        );
    router
        .route('/video-operations/:traceId')
        .get(handlers.handleShowVideoOperation);

    router
        .route('/publish-video')
        .post(bodyParser.json(), handlers.handlePublishVideo);
    router.route('/videos/:id').get(handlers.handleShowVideo);
    router.route('/').get(handlers.handleDashboard);

    return { handlers, router };
};

module.exports = createCreatorsPortal;
