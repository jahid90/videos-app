const env = require('../env');

const category = (streamName) => {
    // Double equals to catch null and undefined
    if (streamName == null) {
        return '';
    }

    return streamName.split('-')[0];
};

const createHandlers = ({ actions }) => {
    return {
        $any: (event) => {
            return actions.upsertCategory(
                category(event.streamName),
                event.id,
                event.globalPosition
            );
        },
    };
};

const createActions = ({ db }) => {
    const upsertCategory = (categoryName, id, globalPosition) => {
        const rawQuery = `
            INSERT INTO
                admin_categories (
                    category_name,
                    message_count,
                    last_message_id,
                    last_message_global_position
                )
            VALUES
                (:categoryName, 1, :id, :globalPosition)
            ON CONFLICT (category_name) DO UPDATE
                SET
                    message_count = admin_categories.message_count + 1,
                    last_message_id = :id,
                    last_message_global_position = :globalPosition
                WHERE
                    admin_categories.last_message_global_position < :globalPosition
        `;

        return db
            .then((client) =>
                client.raw(rawQuery, { categoryName, id, globalPosition })
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminCategoriesAgg-upsertCategory-${id}] skipping ${globalPosition}`
                    );
                }
            });
    };

    return { upsertCategory };
};

const build = ({ db, messageStore }) => {
    const actions = createActions({ db });
    const handlers = createHandlers({ actions });
    const subscription = messageStore.createSubscription({
        streamName: '$all',
        handlers: handlers,
        subscriberId: 'aggregators:admin-categories',
    });

    const start = () => {
        subscription.start();
    };

    return {
        start,
    };
};

module.exports = build;
