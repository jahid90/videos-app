const mustBeLoggedIn = require('./must-be-logged-in');

module.exports = (app, config) => {
    app.use('/', config.homeApp.router);
    app.use('/record-viewing', config.recordViewingsApp.router);
    app.use('/register', config.registerUsersApp.router);
    app.use('/auth', config.authenticationApp.router);
    app.use(
        '/creators-portal',
        mustBeLoggedIn,
        config.creatorsPortalApp.router
    );
};
