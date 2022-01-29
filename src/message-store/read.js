const deserializeMessage = require('./deserialize-message');

const getLastMessageSql = 'SELECT * FROM get_last_stream_message($1)';
const getCategoryMessagesSql =
    'SELECT * FROM get_category_messages($1, $2, $3)';
const getStreamMessagesSql = 'SELECT * FROM get_stream_messages($1, $2, $3)';

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

        if (streamName.includes('-')) {
            query = getStreamMessagesSql;
            values = [streamName, fromPosition, maxMessages];
        } else {
            query = getCategoryMessagesSql;
            values = [streamName, fromPosition, maxMessages];
        }

        return db
            .query(query, values)
            .then((res) => res.rows.map(deserializeMessage));
    };

    const fetch = (streamName, projection) => {
        return read(streamName).then((messages) =>
            project(messages, projection)
        );
    };

    const query = (query, values) => {
        return db.query(query, values);
    };

    return {
        read,
        readLastMessage,
        fetch,
        query,
    };
};

module.exports = createRead;
