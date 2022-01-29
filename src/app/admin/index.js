const camelCaseKeys = require('camelcase-keys');
const express = require('express');

const createHandlers = ({ queries }) => {
    const handleUsersIndex = (req, res) => {
        return queries
            .usersIndex()
            .then((users) =>
                res.render('admin/templates/users-index', { users: users })
            );
    };

    const handleShowUser = (req, res) => {
        const userPromise = queries.user(req.params.id);
        const loginEventsPromise = queries.userLoginEvents(req.params.id);
        const viewingEventsPromise = queries.userViewingEvents(req.params.id);

        return Promise.all([
            userPromise,
            loginEventsPromise,
            viewingEventsPromise,
        ]).then((values) => {
            const user = values[0];
            const loginEvents = values[1];
            const viewingEvents = values[2];

            return res.render('admin/templates/user', {
                user: user,
                loginEvents: loginEvents,
                viewingEvents: viewingEvents,
            });
        });
    };

    const handleMessagesIndex = (req, res) => {
        return queries
            .messages()
            .then((messages) =>
                res.render('admin/templates/messages-index', { messages })
            );
    };

    const handleCorrelatedMessagesIndex = (req, res) => {
        const traceId = req.params.traceId;

        return queries.correlatedMessages(traceId).then((messages) =>
            res.render('admin/templates/messages-index', {
                messages,
                title: 'Correlated Messages',
            })
        );
    };

    const handleUserMessagesIndex = (req, res) => {
        const userId = req.params.userId;

        return res.send(
            `<troll>This handler is left as an exercise for the reader.</troll>
      If it weren't an excercise for the reader, you'd be looking at messages
      for user ${userId}'`
        );
    };

    const handleShowStream = (req, res) => {
        const streamName = req.params.streamName;

        return queries.streamName(streamName).then((messages) =>
            res.render('admin/templates/messages-index', {
                messages: messages,
                title: `Stream: ${streamName}`,
            })
        );
    };

    const handleShowMessage = (req, res) => {
        const messageId = req.params.id;

        return queries
            .message(messageId)
            .then((message) =>
                res.render('admin/templates/message', { message: message })
            );
    };

    const handleStreamsIndex = (req, res) => {
        return queries
            .streams()
            .then((streams) =>
                res.render('admin/templates/streams-index', { streams })
            );
    };

    const handleSubscriberPositions = (req, res) => {
        return queries.subscriberPositions().then((positions) =>
            res.render('admin/templates/subscriber-positions', {
                positions,
            })
        );
    };

    return {
        handleUsersIndex,
        handleShowUser,
        handleMessagesIndex,
        handleCorrelatedMessagesIndex,
        handleUserMessagesIndex,
        handleShowStream,
        handleShowMessage,
        handleStreamsIndex,
        handleSubscriberPositions,
    };
};

const createQueries = ({ db, messageStore }) => {
    const usersIndex = () => {
        return db
            .then((client) => client('admin_users').orderBy('email', 'ASC'))
            .then(camelCaseKeys);
    };

    const user = (id) => {
        return db
            .then((client) => client('admin_users').where({ id: id }))
            .then(camelCaseKeys)
            .then((rows) => rows[0]);
    };

    const userLoginEvents = (userId) => {
        return messageStore
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
        return messageStore
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
        return messageStore
            .query('SELECT * FROM messages ORDER BY global_position ASC')
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const correlatedMessages = (traceId) => {
        return messageStore
            .query(`SELECT * FROM messages WHERE metadata->>'traceId' = $1`, [
                traceId,
            ])
            .then((res) => res.rows)
            .then(camelCaseKeys);
    };

    const streamName = (streamName) => {
        return messageStore
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
        return messageStore
            .query('SELECT * FROM messages WHERE id = $1', [id])
            .then((res) => res.rows)
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

    return {
        usersIndex,
        user,
        userLoginEvents,
        userViewingEvents,
        messages,
        correlatedMessages,
        streamName,
        message,
        streams,
        subscriberPositions,
    };
};

const createAdminApplication = ({ db, messageStore }) => {
    const queries = createQueries({ db, messageStore });
    const handlers = createHandlers({ queries });

    const router = express.Router();

    router.route('/').get((req, res) => res.redirect('/admin/users'));

    router.route('/users').get(handlers.handleUsersIndex);
    router.route('/users/:id').get(handlers.handleShowUser);

    router.route('/messages/:id').get(handlers.handleShowMessage);
    router.route('/messages').get(handlers.handleMessagesIndex);

    router
        .route('/correlated-messages/:traceId')
        .get(handlers.handleCorrelatedMessagesIndex);
    router
        .route('/user-messages/:userId')
        .get(handlers.handleUserMessagesIndex);

    router.route('/streams/:streamName').get(handlers.handleShowStream);
    router.route('/streams').get(handlers.handleStreamsIndex);

    router
        .route('/subscriber-positions')
        .get(handlers.handleSubscriberPositions);

    return {
        handlers,
        queries,
        router,
    };
};

module.exports = createAdminApplication;
