module.exports = (app, config) => {
    app.use('/', config.homeApp.router);
    app.use('/record-viewing', config.recordViewingsApp.router);
}
