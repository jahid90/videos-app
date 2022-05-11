const env = require('../env');

const entity = (streamName) => {
    // Double equals to catch null and undefined
    if (streamName == null) {
        return '';
    }

    return streamName.split(/-(.+)/)[1];
};

const createHandlers = ({ actions }) => {
    return {
        $any: (event) => {
            return actions.upsertEntity(
                entity(event.streamName),
                event.id,
                event.globalPosition
            );
        },
    };
};

const createActions = ({ db }) => {
    const upsertEntity = (entityId, messageId, globalPosition) => {
        const rawQuery = `
            INSERT INTO
                admin_identities (
                    id,
                    message_count,
                    last_message_id,
                    last_message_global_position
                )
            VALUES
                (:entityId, 1, :messageId, :globalPosition)
            ON CONFLICT (id) DO UPDATE
                SET
                    message_count = admin_identities.message_count + 1,
                    last_message_id = :messageId,
                    last_message_global_position = :globalPosition
                WHERE
                    admin_identities.last_message_global_position < :globalPosition
        `;

        return db
            .then((client) =>
                client.raw(rawQuery, { entityId, messageId, globalPosition })
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminIdentitiesAgg-upsertIdentity-${id}] skipping ${globalPosition}`
                    );
                }
            });
    };

    return { upsertEntity };
};

const build = ({ db, messageStore }) => {
    const actions = createActions({ db });
    const handlers = createHandlers({ actions });
    const subscription = messageStore.createSubscription({
        streamName: '$all',
        handlers: handlers,
        subscriberId: 'aggregators:admin-entities',
    });

    const start = () => {
        subscription.start();
    };

    return {
        start,
    };
};

module.exports = build;
