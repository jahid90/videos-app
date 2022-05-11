const Bluebird = require('bluebird');
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
                    metadata: {
                        ...message.metadata,
                        originMessageId: message.id,
                    },
                    data: message.data || {},
                };

                return messageStore.write(message.streamName, messageCopy);
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

    const resetSubscriberPosition = (context) => {
        const { traceId, userId, subscriberId } = context;
        const streamName = `subscriberPosition:command-${subscriberId}`;

        const resetCommand = {
            id: uuid(),
            type: 'ResetPosition',
            metadata: {
                traceId,
                userId,
            },
            data: {
                subscriberId,
            },
        };

        return messageStore.write(streamName, resetCommand);
    };

    return {
        resendMessage,
        clearView,
        deleteMessage,
        deleteAllMessages,
        resetSubscriberPosition,
    };
};

module.exports = createActions;
