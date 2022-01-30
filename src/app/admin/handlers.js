const renderPaginatedMessages = require('./render-paginated-messages');

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

    const handleDeleteMessage = (req, res) => {
        const messageId = req.params.id;

        return queries
            .deleteMessage(messageId)
            .then(() => res.redirect('/admin'));
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

    const handleMessagesOfType = (req, res) => {
        const { type } = req.params;

        return queries
            .messagesByType(type)
            .then((messages) =>
                renderPaginatedMessages(
                    req,
                    res,
                    messages,
                    'admin/templates/messages-index',
                    `Messages of type: ${type}`
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
        handleDeleteMessage,
        handleShowVideo,
        handleStreamsIndex,
        handleSubscriberPositions,
        handleCategoriesIndex,
        handleShowCategory,
        handleMessagesOfType,
    };
};

module.exports = createHandlers;
