const env = require('../env');

const createHandlers = ({ actions }) => {
    return {
        $any: (event) => {
            return actions.upsertStream(
                event.streamName,
                event.id,
                event.globalPosition
            );
        },
    };
};

const createActions = ({ db }) => {
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

        return db
            .then((client) =>
                client.raw(rawQuery, { streamName, id, globalPosition })
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminStreamsAgg-upsertStream-${id}] skipping ${globalPosition}`
                    );
                }
            });
    };

    return { upsertStream };
};

const build = ({ db, messageStore }) => {
    const actions = createActions({ db });
    const handlers = createHandlers({ actions });
    const subscription = messageStore.createSubscription({
        streamName: '$all',
        handlers: handlers,
        subscriberId: 'aggregators:admin-streams',
    });

    const start = () => {
        subscription.start();
    };

    return {
        start,
    };
};

module.exports = build;
