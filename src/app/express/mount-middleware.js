const path = require('path');

const cookieSession = require('cookie-session');
const express = require('express');
const methodOverride = require('method-override');

const attachLocals = require('./attach-locals');
const lastResortErrorHandler = require('./last-resort-error-handler');
const primeRequestContext = require('./prime-request-context');

const mountMiddleware = (app, env) => {
    const cookieSessionMiddleware = cookieSession({
        name: 'session',
        keys: [env.cookieSecret],
        maxAge: 24 * 60 * 60 * 1000,
    });
    app.use(cookieSessionMiddleware);

    app.use(methodOverride('_method'));
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
