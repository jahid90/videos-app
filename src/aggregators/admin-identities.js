const identity = (streamName) => {
    // Double equals to catch null and undefined
    if (streamName == null) {
        return '';
    }

    return streamName.split(/-(.+)/)[1];
};

const createHandlers = ({ queries }) => {
    return {
        $any: (event) => {
            return queries.upsertIdentity(
                identity(event.streamName),
                event.id,
                event.globalPosition
            );
        },
    };
};

const createQueries = ({ db }) => {
    const upsertIdentity = (name, id, globalPosition) => {
        const rawQuery = `
            INSERT INTO
                admin_identities (
                    id,
                    message_count,
                    last_message_id,
                    last_message_global_position
                )
            VALUES
                (:name, 1, :id, :globalPosition)
            ON CONFLICT (id) DO UPDATE
                SET
                    message_count = admin_identities.message_count + 1,
                    last_message_id = :id,
                    last_message_global_position = :globalPosition
                WHERE
                    admin_identities.last_message_global_position < :globalPosition
        `;

        return db
            .then((client) =>
                client.raw(rawQuery, { name, id, globalPosition })
            )
            .then((changed) => {
                if (!changed) {
                    console.debug(
                        `[AdminIdentitiesAgg-upsertIdentity-${id}] skipping ${globalPosition}`
                    );
                }
            });
    };

    return { upsertIdentity };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });
    const subscription = messageStore.createSubscription({
        streamName: '$all',
        handlers: handlers,
        subscriberId: 'aggregators:admin-identities',
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
