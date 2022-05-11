const createActions = ({ db }) => {
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

const createHandlers = ({ actions }) => {
    return {
        VideoNamed: (event) => {
            const videoId = streamToEntityId(event.streamName);
            const wasSuccessful = true;
            const failureReason = null;

            return actions.writeResult(
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

            return actions.writeResult(
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

            return actions.writeResult(
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

            return actions.writeResult(
                event.metadata.traceId,
                videoId,
                wasSuccessful,
                failureReason
            );
        },
    };
};

const build = ({ db, messageStore }) => {
    const actions = createActions({ db });
    const handlers = createHandlers({ actions });
    const subscription = messageStore.createSubscription({
        streamName: 'videoPublishing',
        handlers,
        subscriberId: 'components:video-operations',
    });

    const start = () => {
        return subscription.start();
    };

    return {
        start,
    };
};

module.exports = build;
