const Bluebird = require('bluebird');
const bodyParser = require('body-parser');
const camelcaseKeys = require('camelcase-keys');
const express = require('express');

const NotFoundError = require('../../errors/not-found-error');
const CredentialsMismatchError = require('../../errors/credential-mismatch-error');
const AuthenticationError = require('../../errors/authentication-error');

const loadUserCredential = require('./load-user-credential');
const ensureUserCredentialFound = require('./ensure-user-credential-found');
const validatePassword = require('./validate-password');
const writeLoggedInEvent = require('./write-logged-in-event');
const handleCredentialNotFound = require('./handle-credential-not-found');
const handleCredentialsMismatch = require('./handle-credential-mismatch');

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
    const authenticate = (traceId, email, password) => {
        const context = {
            traceId,
            email,
            messageStore,
            password,
            queries,
        };

        return Bluebird.resolve(context)
            .then(loadUserCredential)
            .then(ensureUserCredentialFound)
            .then(validatePassword)
            .then(writeLoggedInEvent)
            .catch(NotFoundError, () => handleCredentialNotFound(context))
            .catch(CredentialsMismatchError, () =>
                handleCredentialsMismatch(context)
            );
    };

    return {
        authenticate,
    };
};

const createHandlers = ({ actions }) => {
    const handleShowLoginForm = (req, res) => {
        res.render('apps/authenticate/templates/login-form');
    };

    const handleLogOut = (req, res) => {
        req.session = null;
        res.redirect('/');
    };

    const handleAuthenticate = (req, res, next) => {
        const { email, password } = req.body;
        const { traceId } = req.context;

        return actions
            .authenticate(traceId, email, password)
            .then((context) => {
                req.session.userId = context.userCredential.id;
                req.session.role = context.userCredential.role;
                res.redirect('/');
            })
            .catch(AuthenticationError, () =>
                res
                    .status(401)
                    .render('apps/authenticate/templates/login-form', {
                        errors: true,
                    })
            )
            .catch(next);
    };

    return {
        handleShowLoginForm,
        handleAuthenticate,
        handleLogOut,
    };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const actions = createActions({ messageStore, queries });
    const handlers = createHandlers({ actions });

    const router = express.Router();

    router
        .route('/log-in')
        .get(handlers.handleShowLoginForm)
        .post(
            bodyParser.urlencoded({ extended: true }),
            handlers.handleAuthenticate
        );

    router.route('/log-out').get(handlers.handleLogOut);

    return router;
};

module.exports = build;
