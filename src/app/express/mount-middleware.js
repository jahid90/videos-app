const path = require('path');

const cookieSession = require('cookie-session');
const express = require('express');

const attachLocals = require('./attach-locals');
const lastResortErrorHandler = require('./last-resort-error-handler');
const primeRequestContext = require('./prime-request-context');

const mountMiddleware = (app, env) => {
    const cookieSessionMiddleware = cookieSession({ keys: env.cookieSecret });
    app.use(cookieSessionMiddleware);

    app.use(lastResortErrorHandler);
    app.use(primeRequestContext);
    app.use(attachLocals);

    app.use(
        express.static(path.join(__dirname, '..', 'public'), {
            maxAge: 86400000,
        })
    );
};

module.exports = mountMiddleware;
