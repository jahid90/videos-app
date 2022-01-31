const videoStatuses = require('./video-statuses');

const streamToEntityId = (stream) => {
    return stream.split(/-(.+)/)[1];
};

const createHandlers = ({ queries }) => {
    return {
        VideoPublished: (event) =>
            queries.createVideo(
                event.data.videoId,
                event.data.ownerId,
                event.data.sourceUri,
                event.data.transcodedUri,
                event.globalPosition
            ),

        VideoNamed: (event) =>
            queries.updateVideoName(
                streamToEntityId(event.streamName),
                event.globalPosition,
                event.data.name
            ),

        VideoTranscodingFailed: (event) =>
            queries.updateVideoStatus(
                streamToEntityId(event.streamName),
                event.globalPosition,
                videoStatuses.failed
            ),
        VideoDescribed: (event) =>
            queries.updateVideoDescription(
                streamToEntityId(event.streamName),
                event.globalPosition,
                event.data.description
            ),
        VideoViewed: (event) =>
            queries.updateVideoViews(
                streamToEntityId(event.streamName),
                event.globalPosition
            ),
    };
};

const createQueries = ({ db }) => {
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
            .then((client) => {
                client('creators_portal_videos')
                    .where({ id })
                    .then((rows) => rows[0])
                    .then((video) =>
                        console.debug(
                            `[VideosAgg-attemptingVideoNameUpdate-${video.id}] current position is ${video.position}`
                        )
                    );

                return client;
            })
            .then((client) =>
                client('creators_portal_videos')
                    .update({ name, position })
                    .where({ id })
                    .where('position', '<', position)
            )
            .then((changed) => {
                if (!changed) {
                    console.debug(
                        `[VideosAgg-updateVideoName-${id}] skipping ${position}`
                    );
                }
            });
    };

    const updateVideoDescription = (id, position, description) => {
        return db
            .then((client) => {
                client('creators_portal_videos')
                    .where({ id })
                    .then((rows) => rows[0])
                    .then((video) =>
                        console.debug(
                            `[VideosAgg-attemptingVideoDescriptionUpdate-${video.id}] current position is ${video.position}`
                        )
                    );

                return client;
            })
            .then((client) =>
                client('creators_portal_videos')
                    .update({ description, position })
                    .where({ id })
                    .where('position', '<', position)
            )
            .then((changed) => {
                if (!changed) {
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
                if (!changed) {
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
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });
    const subscription = messageStore.createSubscription({
        streamName: 'videoPublishing',
        handlers,
        subscriberId: 'aggregators:creators-videos',
    });
    const videoViewingSubscription = messageStore.createSubscription({
        streamName: 'viewing',
        handlers,
        subscriberId: 'aggregators:video-viewing',
    });

    const start = () => {
        subscription.start();
        videoViewingSubscription.start();
    };

    return {
        handlers,
        queries,
        start,
    };
};

module.exports = build;
