const createQueries = ({ db }) => {
    const writeResult = (traceId, videoId, wasSuccessful, failureReason) => {
        const operation = {
            traceId,
            videoId,
            wasSuccessful,
            failureReason,
        };

        const raw = `
            INSERT INTO
                video_operations(
                    trace_id,
                    video_id,
                    succeeded,
                    failure_reason
                )
            VALUES
                (:traceId, :videoId, :wasSuccessful, :failureReason)
            ON CONFLICT (trace_id) DO NOTHING
        `;

        return db.then((client) => client.raw(raw, operation));
    };

    return {
        writeResult,
    };
};

const streamToEntityId = (stream) => {
    return stream.split(/-(.+)/)[1];
};

const createHandlers = ({ queries }) => {
    return {
        VideoNamed: (event) => {
            const videoId = streamToEntityId(event.streamName);
            const wasSuccessful = true;
            const failureReason = null;

            return queries.writeResult(
                event.metadata.traceId,
                videoId,
                wasSuccessful,
                failureReason
            );
        },
        VideoNameRejected: (event) => {
            const videoId = streamToEntityId(event.streamName);
            const wasSuccessful = false;
            const failureReason = event.data.reason;

            return queries.writeResult(
                event.metadata.traceId,
                videoId,
                wasSuccessful,
                failureReason
            );
        },
        VideoDescribed: (event) => {
            const videoId = streamToEntityId(event.streamName);
            const wasSuccessful = true;
            const failureReason = null;

            return queries.writeResult(
                event.metadata.traceId,
                videoId,
                wasSuccessful,
                failureReason
            );
        },
        VideoDescriptionRejected: (event) => {
            const videoId = streamToEntityId(event.streamName);
            const wasSuccessful = false;
            const failureReason = event.data.reason;

            return queries.writeResult(
                event.metadata.traceId,
                videoId,
                wasSuccessful,
                failureReason
            );
        },
    };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });
    const subscription = messageStore.createSubscription({
        streamName: 'videoPublishing',
        handlers,
        subscriberId: 'components:video-operations',
    });

    const start = () => {
        return subscription.start();
    };

    return {
        queries,
        handlers,
        start,
    };
};

module.exports = build;
