const Bluebird = require('bluebird');
const url = require('url');

const renderPaginatedMessages = require('./render-paginated-messages');

const category = (streamName) => {
    // Double equals to catch null and undefined
    if (streamName == null) {
        return '';
    }

    return streamName.split('-')[0];
};

const identityId = (streamName) => {
    // Double equals to catch null and undefined
    if (streamName == null) {
        return '';
    }

    return streamName.split(/-(.+)/)[1];
};

const createHandlers = ({ actions, queries }) => {
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
        const creatorEventsPromise = queries.userCreatorEvents(req.params.id);

        return Promise.all([
            userPromise,
            loginEventsPromise,
            viewingEventsPromise,
            creatorEventsPromise,
        ]).then((values) => {
            const user = values[0];
            const loginEvents = values[1];
            const viewingEvents = values[2];
            const creatorEvents = values[3];

            return res.render('admin/templates/user', {
                user,
                loginEvents,
                viewingEvents,
                creatorEvents,
            });
        });
    };

    const handleMessagesIndex = (req, res) => {
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
            .then((message) => {
                return {
                    ...message,
                    category: category(message.streamName),
                    identityId: identityId(message.streamName),
                };
            })
            .then((message) =>
                res.render('admin/templates/message', { message })
            );
    };

    const handleVideosIndex = (req, res) => {
        return queries
            .videos()
            .then((videos) =>
                res.render('admin/templates/videos-index', { videos })
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

    const handleSubscriberPositionReset = (req, res) => {
        const referrer = req.get('referrer');
        const parsed = new URL(referrer);

        const context = {
            traceId: req.context.traceId,
            userId: req.context.userId,
            subscriberId: req.params.id,
        };

        return Bluebird.resolve(context).then((context) => {
            return actions
                .resetSubscriberPosition(context)
                .then(() =>
                    res.redirect(
                        `${parsed.pathname}${parsed.search}${parsed.hash}`
                    )
                );
        });
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

    const handleViewsIndex = (req, res) => {
        return queries.views().then((views) => {
            return res.render('admin/templates/views-index', { views });
        });
    };

    const handleClearView = (req, res) => {
        const view = req.params.name;
        const referrer = req.get('referrer');
        const parsed = new URL(referrer);

        return actions
            .clearView(view)
            .then(() =>
                res.redirect(`${parsed.pathname}${parsed.search}${parsed.hash}`)
            );
    };

    const handleDeleteMessage = (req, res) => {
        const messageId = req.params.id;
        const referrer = req.get('referrer');
        const parsed = new URL(referrer);

        return actions
            .deleteMessage(messageId)
            .then(() =>
                res.redirect(`${parsed.pathname}${parsed.search}${parsed.hash}`)
            );
    };

    const handleDeleteAllMessages = (req, res) => {
        const ids = JSON.parse(req.body.messages);
        const referrer = req.get('referrer');
        const parsed = new URL(referrer);

        return actions
            .deleteAllMessages(ids)
            .then(() =>
                res.redirect(`${parsed.pathname}${parsed.search}${parsed.hash}`)
            );
    };

    const handleResendMessage = (req, res) => {
        const messageId = req.params.id;
        const referrer = req.get('referrer');
        const parsed = new URL(referrer);

        return actions
            .resendMessage(messageId)
            .then(() =>
                res.redirect(`${parsed.pathname}${parsed.search}${parsed.hash}`)
            );
    };

    const handleEntitiesIndex = (req, res) => {
        return queries.entities().then((entities) => {
            return res.render('admin/templates/entities-index', {
                entities,
            });
        });
    };

    const handleEntityMessagesIndex = (req, res) => {
        const entityId = req.params.id;

        return queries
            .entityMessages(entityId)
            .then((messages) =>
                renderPaginatedMessages(
                    req,
                    res,
                    messages,
                    'admin/templates/messages-index',
                    `Entity Messages: ${entityId}`
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
        handleVideosIndex,
        handleShowVideo,
        handleStreamsIndex,
        handleSubscriberPositions,
        handleSubscriberPositionReset,
        handleCategoriesIndex,
        handleShowCategory,
        handleMessagesOfType,
        handleViewsIndex,
        handleClearView,
        handleDeleteMessage,
        handleDeleteAllMessages,
        handleResendMessage,
        handleEntitiesIndex,
        handleEntityMessagesIndex,
    };
};

module.exports = createHandlers;
