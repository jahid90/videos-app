const mustBeLoggedIn = require('./must-be-logged-in');

const mountRoutes = (app, config) => {
    app.use('/', config.homeApp.router);
    app.use('/record-viewing', config.recordViewingsApp.router);
    app.use('/register', config.registerUsersApp.router);
    app.use('/auth', config.authenticationApp.router);
    app.use(
        '/creators-portal',
        mustBeLoggedIn,
        config.creatorsPortalApp.router
    );
    app.use('/admin', config.adminApp.router);
};

module.exports = mountRoutes;
