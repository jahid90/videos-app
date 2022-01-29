const streamToSubscriberId = (stream) => {
    return stream.split(/-(.+)/)[1];
};

const createHandlers = ({ queries }) => {
    return {
        Read: (event) => {
            const subscriberId = streamToSubscriberId(event.streamName);

            return queries.upsertPosition(
                subscriberId,
                event.data.position,
                event.globalPosition
            );
        },
    };
};

const createQueries = ({ db }) => {
    const upsertPosition = (
        subscriberId,
        position,
        lastMessageGlobalPosition
    ) => {
        const rawQuery = `
            INSERT INTO
                admin_subscriber_positions (
                    id,
                    position,
                    last_message_global_position
                )
            VALUES
                (:subscriberId, :position, :lastMessageGlobalPosition)
            ON CONFLICT (id) DO UPDATE
                SET
                    position = :position,
                    last_message_global_position = :lastMessageGlobalPosition
                WHERE
                    admin_subscriber_positions.last_message_global_position < :lastMessageGlobalPosition
        `;

        return db.then((client) =>
            client.raw(rawQuery, {
                subscriberId,
                position,
                lastMessageGlobalPosition,
            })
        );
    };

    return { upsertPosition };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });
    const subscription = messageStore.createSubscription({
        streamName: 'subscriberPosition',
        handlers: handlers,
        subscriberId: 'aggregators:admin-subscriber-positions',
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
