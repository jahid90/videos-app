const Bluebird = require('bluebird');

const deserializeMessage = require('./deserialize-message');

const getLastMessageSql = `
    SELECT
        *
    FROM
        get_last_stream_message($1)
`;
const getCategoryMessagesSql = `
    SELECT
        *
    FROM
        get_category_messages($1, $2, $3)
`;
const getStreamMessagesSql = `
    SELECT
        *
    FROM
        get_stream_messages($1, $2, $3)
`;
const getMultipleCategoryMessagesSql = `
    SELECT
        id::varchar,
        stream_name::varchar,
        type::varchar,
        position::bigint,
        global_position::bigint,
        data::varchar,
        metadata::varchar,
        time::timestamp
    FROM
        messages
    WHERE
        category(stream_name) = ANY($1::varchar[])
    AND
        global_position >= $2
    ORDER BY
        global_position
    LIMIT $3
`;
const getAllMessagesSql = `
    SELECT
        id::varchar,
        stream_name::varchar,
        type::varchar,
        position::bigint,
        global_position::bigint,
        data::varchar,
        metadata::varchar,
        time::timestamp
    FROM
        messages
    WHERE
        global_position >= $1
    ORDER BY
        global_position
    LIMIT $2
`;

const project = (events, projection) => {
    return events.reduce((entity, event) => {
        if (!projection[event.type]) {
            return entity;
        }

        return projection[event.type](entity, event);
    }, projection.$init());
};

const createRead = ({ db }) => {
    const readLastMessage = (streamName) => {
        return db
            .query(getLastMessageSql, [streamName])
            .then((res) => deserializeMessage(res.rows[0]));
    };

    const read = (streamName, fromPosition = 0, maxMessages = 1000) => {
        let query = null;
        let values = [];

        if (Array.isArray(streamName)) {
            streamName.forEach((category) => {
                if (category.includes('-')) {
                    throw new Error(
                        `Only categories allowed for multi-subscriptions. Got: ${category}`
                    );
                }
            });

            query = getMultipleCategoryMessagesSql;
            values = [streamName, fromPosition, maxMessages];
        } else if (streamName === '$all') {
            query = getAllMessagesSql;
            values = [fromPosition, maxMessages];
        } else if (streamName.includes('-')) {
            query = getStreamMessagesSql;
            values = [streamName, fromPosition, maxMessages];
        } else {
            query = getCategoryMessagesSql;
            values = [streamName, fromPosition, maxMessages];
        }

        return db
            .query(query, values)
            .then((res) => res.rows.map(deserializeMessage))
            .catch((err) => {
                console.error(err);
                return Bluebird.resolve([]);
            });
    };

    const fetch = (streamName, projection) => {
        return read(streamName).then((messages) =>
            project(messages, projection)
        );
    };

    return {
        read,
        readLastMessage,
        fetch,
    };
};

module.exports = createRead;
