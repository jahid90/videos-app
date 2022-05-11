const createActions = ({ db }) => {
    const createUserCredential = (id, email, passwordHash) => {
        const rawQuery = `
            INSERT INTO
                user_credentials(id, email, password_hash)
            VALUES
                (:id, :email, :passwordHash)
            ON CONFLICT DO NOTHING
        `;

        return db.then((client) =>
            client.raw(rawQuery, { id, email, passwordHash })
        );
    };

    const addAdminPrivilege = (id) => {
        return db.then((client) =>
            client('user_credentials').update({ role: 'admin' }).where({ id })
        );
    };

    const removeAdminPrivilege = (id) => {
        return db.then((client) =>
            client('user_credentials').update({ role: null }).where({ id })
        );
    };

    return {
        createUserCredential,
        addAdminPrivilege,
        removeAdminPrivilege,
    };
};

const createHandlers = ({ actions }) => {
    return {
        Registered: (event) => {
            return actions.createUserCredential(
                event.data.userId,
                event.data.email,
                event.data.passwordHash
            );
        },
        AdminPrivilegeAdded: (event) => {
            return actions.addAdminPrivilege(event.data.userId);
        },
        AdminPrivilegeRemoved: (event) => {
            return actions.removeAdminPrivilege(event.data.userId);
        },
    };
};

const build = ({ db, messageStore }) => {
    const actions = createActions({ db });
    const handlers = createHandlers({ actions });
    const subscription = messageStore.createSubscription({
        streamName: 'identity',
        handlers,
        subscriberId: 'aggregators:user-credentials',
    });

    const start = () => {
        subscription.start();
    };

    return {
        start,
    };
};

module.exports = build;
