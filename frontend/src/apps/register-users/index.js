const Bluebird = require('bluebird');
const bodyParser = require('body-parser');
const camelcaseKeys = require('camelcase-keys');
const express = require('express');
const { v4: uuid } = require('uuid');

const ValidationError = require('../../errors/validation-error');
const validate = require('./validate');
const loadExistingIdentity = require('./load-existing-identity');
const ensureThereWasNoExistingIdentity = require('./ensure-there-was-no-existing-identity');
const hashPassword = require('./hash-password');
const writeRegisterCommand = require('./write-register-command');

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
    const registerUser = (traceId, attributes) => {
        const context = { attributes, traceId, messageStore, queries };

        return Bluebird.resolve(context)
            .then(validate)
            .then(loadExistingIdentity)
            .then(ensureThereWasNoExistingIdentity)
            .then(hashPassword)
            .then(writeRegisterCommand);
    };

    return {
        registerUser,
    };
};

const createHandlers = ({ actions }) => {
    const handleRegistrationForm = (req, res) => {
        const userId = uuid();

        res.render('apps/register-users/templates/register', { userId });
    };

    const handleRegistrationComplete = (req, res) => {
        res.render('apps/register-users/templates/registration-complete');
    };

    const handleRegisterUser = (req, res, next) => {
        const attributes = {
            id: req.body.id,
            email: req.body.email,
            password: req.body.password,
        };

        return actions
            .registerUser(req.context.traceId, attributes)
            .then(() => res.redirect(301, 'register/registration-complete'))
            .catch(ValidationError, (err) =>
                res
                    .status(400)
                    .render('apps/register-users/templates/register', {
                        userId: attributes.id,
                        errors: err.errors,
                    })
            )
            .catch(next);
    };

    return {
        handleRegistrationForm,
        handleRegistrationComplete,
        handleRegisterUser,
    };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const actions = createActions({ messageStore, queries });
    const handlers = createHandlers({ actions });

    const router = express.Router();

    router
        .route('/')
        .get(handlers.handleRegistrationForm)
        .post(
            bodyParser.urlencoded({ extended: true }),
            handlers.handleRegisterUser
        );

    router
        .route('/registration-complete')
        .get(handlers.handleRegistrationComplete);

    return {
        actions,
        handlers,
        queries,
        router,
    };
};

module.exports = build;
