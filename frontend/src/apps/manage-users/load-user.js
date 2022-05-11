const loadUser = (context) => {
    return context.queries.byEmail(context.email).then((user) => {
        context.user = user;
        return context;
    });
};

module.exports = loadUser;
