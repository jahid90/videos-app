const env = require('../env');

const videoStatuses = require('./video-statuses');

const streamToEntityId = (stream) => {
    return stream.split(/-(.+)/)[1];
};

const createHandlers = ({ actions }) => {
    return {
        VideoPublished: (event) =>
            actions.createVideo(
                event.data.videoId,
                event.data.ownerId,
                event.data.sourceUri,
                event.data.transcodedUri,
                event.globalPosition
            ),

        VideoNamed: (event) =>
            actions.updateVideoName(
                streamToEntityId(event.streamName),
                event.globalPosition,
                event.data.name
            ),

        VideoTranscodingFailed: (event) =>
            actions.updateVideoStatus(
                streamToEntityId(event.streamName),
                event.globalPosition,
                videoStatuses.failed
            ),
        VideoDescribed: (event) =>
            actions.updateVideoDescription(
                streamToEntityId(event.streamName),
                event.globalPosition,
                event.data.description
            ),
        VideoViewed: (event) =>
            actions.updateVideoViews(
                streamToEntityId(event.streamName),
                event.globalPosition
            ),
    };
};

const createActions = ({ db }) => {
    const createVideo = (id, ownerId, sourceUri, transcodedUri, position) => {
        const video = {
            id,
            ownerId,
            sourceUri,
            transcodedUri,
            position,
        };

        const raw = `
            INSERT INTO
                creators_portal_videos (
                    id,
                    owner_id,
                    source_uri,
                    transcoded_uri,
                    position
                )
            VALUES
                (:id, :ownerId, :sourceUri, :transcodedUri, :position)
            ON CONFLICT (id) DO NOTHING
        `;

        return db.then((client) => client.raw(raw, video));
    };

    const updateVideoName = (id, position, name) => {
        return db
            .then((client) =>
                client('creators_portal_videos')
                    .update({ name, position })
                    .where({ id })
                    .where('position', '<', position)
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[VideosAgg-updateVideoName-${id}] skipping ${position}`
                    );
                }
            });
    };

    const updateVideoDescription = (id, position, description) => {
        return db
            .then((client) =>
                client('creators_portal_videos')
                    .update({ description, position })
                    .where({ id })
                    .where('position', '<', position)
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[VideosAgg-updateVideoDescription-${id}] skipping ${position}`
                    );
                }
            });
    };

    const updateVideoViews = (id, position) => {
        const rawQuery = `
            UPDATE
                creators_portal_videos
            SET
                views = creators_portal_videos.views + 1, position = :position
            WHERE
                id = :id
            AND
                position < :position
        `;

        return db
            .then((client) => client.raw(rawQuery, { id, position }))
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[VideosAgg-updateVideoViews-${id}] skipping ${position}`
                    );
                }
            });
    };

    return {
        createVideo,
        updateVideoName,
        updateVideoDescription,
        updateVideoViews,
    };
};

const build = ({ db, messageStore }) => {
    const actions = createActions({ db });
    const handlers = createHandlers({ actions });
    const subscription = messageStore.createSubscription({
        streamName: ['videoPublishing', 'viewing'],
        handlers,
        subscriberId: 'aggregators:creators-videos',
    });

    const start = () => {
        subscription.start();
    };

    return {
        start,
    };
};

module.exports = build;
