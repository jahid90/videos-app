const path = require('path');

const express = require('express');

const mountMiddleware = require('./mount-middleware');
const mountRoutes = require('./mount-routes');

module.exports = ({ config, env }) => {

    const app = express();

    app.set('views', path.join(__dirname, '..'));
    app.set('view engine', 'pug');

    mountMiddleware(app, env);
    mountRoutes(app, config);

    return app;

}
