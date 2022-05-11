const loadUserCredential = (context) => {
    return context.queries.byEmail(context.email).then((userCredential) => {
        context.userCredential = userCredential;
        return context;
    });
};

module.exports = loadUserCredential;
