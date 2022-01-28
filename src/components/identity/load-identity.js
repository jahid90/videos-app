const identityProjection = {
    $init: () => {
        return {
            id: null,
            email: null,
            isRegistered: false,
            isLocked: false,
            lockedTime: null,
            registrationEmailSent: false,
        };
    },
    Registered: (identity, registered) => {
        identity.id = registered.data.userId;
        identity.email = registered.data.email;
        identity.isRegistered = true;

        return identity;
    },
    AccountLocked: (identity, accountLocked) => {
        identity.isLocked = true;
        identity.lockedTime = accountLocked.data.lockedTime;

        return identity;
    },
    AccountUnlocked: (identity) => {
        identity.isLocked = false;
        identity.lockedTime = null;

        return identity;
    },
    RegistrationEmailSent: (identity) => {
        identity.registrationEmailSent = true;

        return identity;
    },
};

const loadIdentity = (context) => {
    const { identityId, messageStore } = context;
    const identityStreamName = `identity-${identityId}`;

    return messageStore
        .fetch(identityStreamName, identityProjection)
        .then((identity) => {
            context.identity = identity;
            return context;
        });
};

module.exports = loadIdentity;
