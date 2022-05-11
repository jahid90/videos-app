const Bluebird = require('bluebird');
const bodyParser = require('body-parser');
const camelcaseKeys = require('camelcase-keys');
const express = require('express');

const NotFoundError = require('../../errors/not-found-error');

const loadUser = require('./load-user');
const ensureUserFound = require('./ensure-user-found');
const writeAdminPrivilegeAddedEvent = require('./write-admin-privilege-added-event');
const writeAdminPrivilegeRemovedEvent = require('./write-admin-privilege-removed-event');

const createQueries = ({ db }) => {
    const byEmail = (email) => {
        return db
            .then((client) =>
                client('user_credentials').where({ email }).limit(1)
            )
            .then(camelcaseKeys)
            .then((rows) => rows[0]);
    };

    return {
        byEmail,
    };
};

const createActions = ({ messageStore, queries }) => {
    const addAdminPrivilege = (traceId, email) => {
        const context = {
            traceId,
            email,
            messageStore,
            queries,
        };

        return Bluebird.resolve(context)
            .then(loadUser)
            .then(ensureUserFound)
            .then(writeAdminPrivilegeAddedEvent)
            .catch(NotFoundError, () => handleUserNotFound(context));
    };

    const removeAdminPrivilege = (traceId, email) => {
        const context = {
            traceId,
            email,
            messageStore,
            queries,
        };

        return Bluebird.resolve(context)
            .then(loadUser)
            .then(ensureUserFound)
            .then(writeAdminPrivilegeRemovedEvent)
            .catch(NotFoundError, () => handleUserNotFound(context));
    };

    return {
        addAdminPrivilege,
        removeAdminPrivilege,
    };
};

const createHandlers = ({ actions }) => {
    const handleAdminPrivilegeAdd = (req, res) => {
        const { email } = req.body;
        const { traceId } = req.context;

        return actions
            .addAdminPrivilege(traceId, email)
            .then((context) => res.redirect('/admin/users'));
    };

    const handleAdminPrivilegeRemoval = (req, res) => {
        const { email } = req.body;
        const { traceId } = req.context;

        return actions
            .removeAdminPrivilege(traceId, email)
            .then((context) => res.redirect('/admin/users'));
    };

    return {
        handleAdminPrivilegeAdd,
        handleAdminPrivilegeRemoval,
    };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const actions = createActions({ messageStore, queries });
    const handlers = createHandlers({ actions });

    const router = express.Router();

    router
        .route('/add-admin-privilege')
        .post(
            bodyParser.urlencoded({ extended: false }),
            handlers.handleAdminPrivilegeAdd
        );
    router
        .route('/remove-admin-privilege')
        .post(
            bodyParser.urlencoded({ extended: false }),
            handlers.handleAdminPrivilegeRemoval
        );

    return {
        actions,
        handlers,
        queries,
        router,
    };
};

module.exports = build;
