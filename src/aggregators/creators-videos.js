const videoStatuses = require('./video-statuses');

const streamToEntityId = (stream) => {
    return stream.split(/-(.+)/)[1];
};

const createHandlers = ({ messageStore, queries }) => {
    return {
        VideoPublished: (event) =>
            queries.createVideo(
                event.data.videoId,
                event.data.ownerId,
                event.data.sourceUri,
                event.data.transcodedUri,
                event.position
            ),

        VideoNamed: (event) =>
            queries.updateVideoName(
                streamToEntityId(event.streamName),
                event.position,
                event.data.name
            ),

        VideoTranscodingFailed: (event) =>
            queries.updateVideoStatus(
                streamToEntityId(event.streamName),
                event.position,
                videoStatuses.failed
            ),
        VideoDescribed: (event) =>
            queries.updateVideoDescription(
                streamToEntityId(event.streamName),
                event.position,
                event.data.description
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
        return db.then((client) =>
            client('creators_portal_videos')
                .update({ name, position })
                .where({ id })
                .where('position', '<', position)
        );
    };

    const updateVideoDescription = (id, position, description) => {
        return db.then((client) =>
            client('creators_portal_videos')
                .update({ description, position })
                .where({ id })
                .where('position', '<', position)
        );
    };

    return {
        createVideo,
        updateVideoName,
        updateVideoDescription,
    };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ messageStore, queries });
    const subscription = messageStore.createSubscription({
        streamName: 'videoPublishing',
        handlers,
        subscriberId: 'aggregators:creators-videos',
    });

    const start = () => {
        subscription.start();
    };

    return {
        handlers,
        queries,
        start,
    };
};

module.exports = build;
