const identityProjection = {
    $init: () => {
        return {
            id: null,
            email: null,
            isRegistered: false,
            isLocked: false,
            lastLockedTime: null,
        };
    },
    Registered: (identity, registered) => {
        identity.id = registered.data.id;
        identity.email = registered.data.email;
        identity.isRegistered = true;

        return identity;
    },
    AccountLocked: (identity, accountLocked) => {
        identity.isLocked = true;
        identity.lastLockedTime = accountLocked.data.lockedTime;
    },
    AccountUnlocked: (identity, accountUnlocked) => {
        identity.isLocked = false;
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
