const createHandlers = ({ queries }) => {
    return {
        $any: (event) =>
            queries.upsertStream(
                event.streamName,
                event.id,
                event.globalPosition
            ),
    };
};

const createQueries = ({ db }) => {
    const upsertStream = (streamName, id, globalPosition) => {
        const rawQuery = `
            INSERT INTO
                admin_streams (
                    stream_name,
                    message_count,
                    last_message_id,
                    last_message_global_position
                )
            VALUES
                (:streamName, 1, :id, :globalPosition)
            ON CONFLICT (stream_name) DO UPDATE
                SET
                    message_count = admin_streams.message_count + 1,
                    last_message_id = :id,
                    last_message_global_position = :globalPosition
                WHERE
                    admin_streams.last_message_global_position < :globalPosition
        `;

        return db.then((client) =>
            client.raw(rawQuery, { streamName, id, globalPosition })
        );
    };

    return { upsertStream };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });
    const subscription = messageStore.createSubscription({
        streamName: '$all',
        handlers: handlers,
        subscriberId: 'aggregators:admin-streams',
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
