const mustBeLoggedIn = require('./must-be-logged-in');
const mustBeAdminUser = require('./must-be-admin-user');

const mountRoutes = (app, config) => {
    app.use('/', config.homeApp);
    app.use('/ping', config.pingApp);
    app.use('/record-viewing', config.recordViewingsApp);
    app.use('/register', config.registerUsersApp);
    app.use('/auth', config.authenticationApp);
    app.use('/creators-portal', mustBeLoggedIn, config.creatorsPortalApp);
    app.use('/admin', mustBeLoggedIn, mustBeAdminUser, config.adminApp);
    app.use('/users', mustBeLoggedIn, mustBeAdminUser, config.manageUsersApp);
};

module.exports = mountRoutes;
