const path = require('path');

const express = require('express');

const attachLocals = require('./attach-locals');
const lastResortErrorHandler = require('./last-resort-error-handler');
const primeRequestContext = require('./prime-request-context');

module.exports = (app, env) => {

    app.use(lastResortErrorHandler);
    app.use(primeRequestContext);
    app.use(attachLocals);

    app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: 86400000 }));

}
