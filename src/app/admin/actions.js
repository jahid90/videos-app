const camelcaseKeys = require('camelcase-keys');
const { v4: uuid } = require('uuid');

const createActions = ({ db, messageStore, messageStoreDb }) => {
    const resendMessage = (messageId) => {
        return messageStoreDb
            .query(
                `
            SELECT * FROM messages WHERE id = $1 LIMIT 1
        `,
                [messageId]
            )
            .then((res) => res.rows)
            .then((rows) => rows[0])
            .then(camelcaseKeys)
            .then((message) => {
                const messageCopy = {
                    id: uuid(),
                    type: message.type,
                    metadata: message.metadata || {},
                    data: message.data || {},
                };

                return messageStore.write(message.streamName, messageCopy);
            });
    };

    return {
        resendMessage,
    };
};

module.exports = createActions;
