const env = require('../env');

const streamToSubscriberId = (stream) => {
    return stream.split(/-(.+)/)[1];
};

const createHandlers = ({ actions }) => {
    return {
        Read: (event) => {
            const subscriberId = streamToSubscriberId(event.streamName);

            return actions.upsertPosition(
                subscriberId,
                event.data.position,
                event.globalPosition,
                event.data.lastMessageId
            );
        },
        PositionReset: (event) => {
            const subscriberId = streamToSubscriberId(event.streamName);

            return actions.upsertPosition(
                subscriberId,
                event.data.position,
                event.globalPosition,
                event.data.lastMessageId
            );
        },
    };
};

const createActions = ({ db }) => {
    const upsertPosition = (
        subscriberId,
        position,
        lastMessageGlobalPosition,
        lastMessageId
    ) => {
        const rawQuery = `
            INSERT INTO
                admin_subscriber_positions (
                    id,
                    position,
                    last_message_global_position,
                    last_message_id
                )
            VALUES
                (:subscriberId, :position, :lastMessageGlobalPosition, :lastMessageId)
            ON CONFLICT (id) DO UPDATE
                SET
                    position = :position,
                    last_message_global_position = :lastMessageGlobalPosition,
                    last_message_id = :lastMessageId
                WHERE
                    admin_subscriber_positions.last_message_global_position < :lastMessageGlobalPosition
        `;

        return db
            .then((client) =>
                client.raw(rawQuery, {
                    subscriberId,
                    position,
                    lastMessageGlobalPosition,
                    lastMessageId,
                })
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminSubsPositionAgg-upsertPosition-${id}] skipping ${lastMessageGlobalPosition}`
                    );
                }
            });
    };

    return { upsertPosition };
};

const build = ({ db, messageStore }) => {
    const actions = createActions({ db });
    const handlers = createHandlers({ actions });
    const subscription = messageStore.createSubscription({
        streamName: 'subscriberPosition',
        handlers: handlers,
        subscriberId: 'aggregators:admin-subscriber-positions',
    });

    const start = () => {
        subscription.start();
    };

    return {
        start,
    };
};

module.exports = build;
