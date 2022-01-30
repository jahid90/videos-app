const camelCaseKeys = require('camelcase-keys');
const express = require('express');

const MESSSAGES_PER_PAGE = 10;

const renderPaginatedMessages = (req, res, messages, viewName, title) => {
    const pageFromReq = (req.query.page && parseInt(req.query.page, 10)) || 1;
    const pages = Math.ceil(messages.length / MESSSAGES_PER_PAGE);
    const currentPage =
        pageFromReq < 1 ? 1 : pageFromReq > pages ? pages : pageFromReq;
    const startIndex = (currentPage - 1) * MESSSAGES_PER_PAGE;
    const filtered = messages.slice(
        startIndex,
        startIndex + MESSSAGES_PER_PAGE
    );

    res.render(viewName, {
        title,
        messages: filtered,
        currentPage,
        perPage: MESSSAGES_PER_PAGE,
        pages,
    });
};

const createHandlers = ({ queries }) => {
    const handleUsersIndex = (req, res) => {
        return queries
            .usersIndex()
            .then((users) =>
                res.render('admin/templates/users-index', { users })
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
        const userId = req.params.userId;

        return queries
            .messages()
            .then((messages) =>
                renderPaginatedMessages(
                    req,
                    res,
                    messages,
                    'admin/templates/messages-index'
                )
            );
    };

    const handleCorrelatedMessagesIndex = (req, res) => {
        const traceId = req.params.traceId;

        return queries
            .correlatedMessages(traceId)
            .then((messages) =>
                renderPaginatedMessages(
                    req,
                    res,
                    messages,
                    'admin/templates/messages-index',
                    'Correlated Messages'
                )
            );
    };

    const handleUserMessagesIndex = (req, res) => {
        const userId = req.params.userId;
        const pageFromReq =
            (req.query.page && parseInt(req.query.page, 10)) || 1;
        const perPage = 10;

        return queries
            .userMessages(userId)
            .then((messages) =>
                renderPaginatedMessages(
                    req,
                    res,
                    messages,
                    'admin/templates/messages-index',
                    'User Messages'
                )
            );
    };

    const handleShowStream = (req, res) => {
        const streamName = req.params.streamName;

        return queries
            .streamName(streamName)
            .then((messages) =>
                renderPaginatedMessages(
                    req,
                    res,
                    messages,
                    'admin/templates/messages-index',
                    `Stream: ${streamName}`
                )
            );
    };

    const handleShowMessage = (req, res) => {
        const messageId = req.params.id;

        return queries
            .message(messageId)
            .then((message) =>
                res.render('admin/templates/message', { message })
            );
    };

    const handleShowVideo = (req, res) => {
        const videoId = req.params.id;

        return queries
            .video(videoId)
            .then((video) =>
                res.render('admin/templates/video', { video, videoId })
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

    const handleCategoriesIndex = (req, res) => {
        return queries
            .categories()
            .then((categories) =>
                res.render('admin/templates/categories-index', { categories })
            );
    };

    const handleShowCategory = (req, res) => {
        const categoryName = req.params.categoryName;

        return queries
            .categoryName(categoryName)
            .then((messages) =>
                renderPaginatedMessages(
                    req,
                    res,
                    messages,
                    'admin/templates/messages-index',
                    `Category: ${categoryName}`
                )
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
        handleShowVideo,
        handleStreamsIndex,
        handleSubscriberPositions,
        handleCategoriesIndex,
        handleShowCategory,
    };
};

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

    return {
        usersIndex,
        user,
        userLoginEvents,
        userViewingEvents,
        messages,
        correlatedMessages,
        userMessages,
        streamName,
        message,
        video,
        streams,
        subscriberPositions,
        categories,
        categoryName,
    };
};

const createAdminApplication = ({ db, messageStoreDb }) => {
    const queries = createQueries({ db, messageStoreDb });
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

    router.route('/streams').get(handlers.handleStreamsIndex);
    router.route('/streams/:streamName').get(handlers.handleShowStream);

    router
        .route('/subscriber-positions')
        .get(handlers.handleSubscriberPositions);

    router.route('/video/:id').get(handlers.handleShowVideo);

    router.route('/categories').get(handlers.handleCategoriesIndex);
    router.route('/categories/:categoryName').get(handlers.handleShowCategory);

    return {
        handlers,
        queries,
        router,
    };
};

module.exports = createAdminApplication;
