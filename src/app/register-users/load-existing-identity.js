const loadExistingIdentity = (context) => {
    return context.queries
        .byEmail(context.attributes.email)
        .then((existingIdentity) => {
            context.existingIdentity = existingIdentity;

            return context;
        });
};

module.exports = loadExistingIdentity;
