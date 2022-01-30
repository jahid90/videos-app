const Bluebird = require('bluebird');
const camelCaseKeys = require('camelcase-keys');

const createQueries = ({ db, messageStoreDb }) => {
    const usersIndex = () => {
        return db
            .then((client) => client('admin_users').orderBy('email', 'ASC'))
            .then(camelCaseKeys);
    };

    const user = (id) => {
        return db
            .then((client) => client('admin_users').where({ id }))
            .then(camelCaseKeys)
            .then((rows) => rows[0]);
    };

    const userLoginEvents = (userId) => {
        return messageStoreDb
            .query(
                `
                SELECT
                    *
                FROM
                    messages
                WHERE
                    stream_name=$1
                ORDER BY
                    global_position ASC
            `,
                [`authentication-${userId}`]
            )
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const userViewingEvents = (userId) => {
        return messageStoreDb
            .query(
                `
                SELECT
                    *
                FROM
                    messages
                WHERE
                    category(stream_name) = 'viewing'
                AND
                    metadata->>'userId' = $1
                ORDER BY
                    global_position ASC
            `,
                [userId]
            )
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const messages = () => {
        return messageStoreDb
            .query('SELECT * FROM messages ORDER BY global_position ASC')
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const correlatedMessages = (traceId) => {
        return messageStoreDb
            .query(`SELECT * FROM messages WHERE metadata->>'traceId' = $1`, [
                traceId,
            ])
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const userMessages = (userId) => {
        return messageStoreDb
            .query(`SELECT * from messages WHERE metadata->>'userId' = $1`, [
                userId,
            ])
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const streamName = (streamName) => {
        return messageStoreDb
            .query(
                `
                SELECT
                    *
                FROM
                    messages
                WHERE
                    stream_name = $1
                ORDER BY
                    global_position ASC
            `,
                [streamName]
            )
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const message = (id) => {
        return messageStoreDb
            .query('SELECT * FROM messages WHERE id = $1', [id])
            .then((res) => res.rows)
            .then(camelCaseKeys)
            .then((rows) => rows[0]);
    };

    const video = (id) => {
        return db
            .then((client) => client('creators_portal_videos').where({ id }))
            .then(camelCaseKeys)
            .then((rows) => rows[0]);
    };

    const streams = () => {
        return db
            .then((client) =>
                client('admin_streams').orderBy('stream_name', 'ASC')
            )
            .then(camelCaseKeys);
    };

    const subscriberPositions = () => {
        return db.then((client) =>
            client('admin_subscriber_positions').then(camelCaseKeys)
        );
    };

    const categories = () => {
        return db
            .then((client) =>
                client('admin_categories').orderBy('category_name', 'ASC')
            )
            .then(camelCaseKeys);
    };

    const categoryName = (categoryName) => {
        return messageStoreDb
            .query(
                `
                SELECT
                    *
                FROM
                    messages
                WHERE
                    stream_name LIKE $1
                ORDER BY
                    global_position ASC
            `,
                [categoryName + '-%']
            )
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const messagesByType = (type) => {
        return messageStoreDb
            .query(
                `
            SELECT
                *
            FROM
                messages
            WHERE
                type LIKE $1
            ORDER BY
                global_position ASC
        `,
                [type]
            )
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const views = () => {
        const views = [
            { name: 'admin_categories' },
            { name: 'admin_streams' },
            { name: 'admin_subscriber_positions' },
            { name: 'admin_users' },
            { name: 'creators_portal_videos' },
            { name: 'pages' },
            { name: 'user_credentials' },
            { name: 'video_operations' },
        ];

        return Bluebird.each(views, (view) => {
            return db
                .then((client) => client(view.name).count('* as count'))
                .then((total) => {
                    view.count = total[0].count;
                });
        });
    };

    const clearView = (view) => {
        return db.then((client) => client(view).delete());
    };

    const deleteMessage = (id) => {
        return messageStoreDb.query('DELETE FROM messages WHERE id = $1', [id]);
    };

    const deleteAllMessages = (ids) => {
        return Bluebird.each(ids, (id) => {
            return messageStoreDb.query('DELETE FROM messages WHERE id = $1', [
                id,
            ]);
        });
    };

    return {
        usersIndex,
        user,
        userLoginEvents,
        userViewingEvents,
        messages,
        messagesByType,
        correlatedMessages,
        userMessages,
        streamName,
        message,
        video,
        streams,
        subscriberPositions,
        categories,
        categoryName,
        views,
        clearView,
        deleteMessage,
        deleteAllMessages,
    };
};

module.exports = createQueries;
