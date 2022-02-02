const createQueries = ({ db }) => {
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

const createHandlers = ({ queries }) => {
    return {
        Registered: (event) => {
            return queries.createUserCredential(
                event.data.userId,
                event.data.email,
                event.data.passwordHash
            );
        },
        AdminPrivilegeAdded: (event) => {
            return queries.addAdminPrivilege(event.data.userId);
        },
        AdminPrivilegeRemoved: (event) => {
            return queries.removeAdminPrivilege(event.data.userId);
        },
    };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });
    const subscription = messageStore.createSubscription({
        streamName: 'identity',
        handlers,
        subscriberId: 'aggregators:user-credentials',
    });

    const start = () => {
        subscription.start();
    };

    return {
        handlers,
        queries,
        start,
    };
};

module.exports = build;
