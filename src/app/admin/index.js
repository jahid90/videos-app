const express = require('express');

const createQueries = require('./queries');
const createHandlers = require('./handlers');

const createAdminApplication = ({ db, messageStoreDb }) => {
    const queries = createQueries({ db, messageStoreDb });
    const handlers = createHandlers({ queries });

    const router = express.Router();

    router.route('/').get((req, res) => res.redirect('/admin/users'));

    router.route('/users').get(handlers.handleUsersIndex);
    router.route('/users/:id').get(handlers.handleShowUser);

    router.route('/messages/:id').get(handlers.handleShowMessage);
    router.route('/messages').get(handlers.handleMessagesIndex);
    router.route('/messages/:id').delete(handlers.handleDeleteMessage);

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

    router.route('/type-messages/:type').get(handlers.handleMessagesOfType);

    return {
        handlers,
        queries,
        router,
    };
};

module.exports = createAdminApplication;
