const env = require('../env');

const category = (streamName) => {
    return streamName.split('-')[0];
};

const createHandlers = ({ queries }) => {
    return {
        $any: (event) => {
            return queries.upsertType(
                event.type,
                category(event.streamName),
                event.id,
                event.globalPosition
            );
        },
    };
};

const createQueries = ({ db }) => {
    const upsertType = (type, category, messageId, globalPosition) => {
        const rawQuery = `
            INSERT INTO
                admin_event_types (
                    type,
                    stream_name,
                    message_count,
                    last_message_id,
                    last_message_global_position
                )
            VALUES
                (:type, :category, 1, :messageId, :globalPosition)
            ON CONFLICT (type, stream_name) DO UPDATE
                SET
                    message_count = admin_event_types.message_count + 1,
                    last_message_id = :messageId,
                    last_message_global_position = :globalPosition
                WHERE
                    admin_event_types.last_message_global_position < :globalPosition
        `;

        return db
            .then((client) =>
                client.raw(rawQuery, {
                    type,
                    category,
                    messageId,
                    globalPosition,
                })
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminEventTypesAgg-upsertType-${messageId}] skipping ${globalPosition}`
                    );
                }
            });
    };

    return { upsertType };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });
    const subscription = messageStore.createSubscription({
        streamName: '$all',
        handlers: handlers,
        subscriberId: 'aggregators:admin-event-types',
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
