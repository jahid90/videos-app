const mustBeLoggedIn = require('./must-be-logged-in');
const mustBeAdminUser = require('./must-be-admin-user');

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
    app.use('/admin', mustBeAdminUser, config.adminApp.router);
};

module.exports = mountRoutes;
