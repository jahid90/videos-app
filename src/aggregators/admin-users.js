const createIdentityHandlers = ({ queries }) => {
    return {
        Registered: (event) =>
            queries
                .ensureUser(event.data.userId)
                .then(() =>
                    queries.setEmail(
                        event.data.userId,
                        event.data.email,
                        event.globalPosition
                    )
                ),

        RegistrationEmailSent: (event) =>
            queries
                .ensureUser(event.data.userId)
                .then(() =>
                    queries.markRegistrationEmailSent(
                        event.data.userId,
                        event.globalPosition
                    )
                ),
    };
};

const createAuthenticationHandlers = ({ queries }) => {
    return {
        UserLoggedIn: (event) =>
            queries
                .ensureUser(event.data.userId)
                .then(() =>
                    queries.incrementLogin(
                        event.data.userId,
                        event.globalPosition
                    )
                ),
    };
};

const createQueries = ({ db }) => {
    const ensureUser = (id) => {
        const rawQuery = `
            INSERT INTO
                admin_users (id)
            VALUES
                (:id)
            ON CONFLICT DO NOTHING
        `;

        return db.then((client) => client.raw(rawQuery, { id }));
    };

    const incrementLogin = (id, eventGlobalPosition) => {
        const rawQuery = `
            UPDATE
                admin_users
            SET
                login_count = login_count + 1,
                last_authentication_event_global_position = :eventGlobalPosition
            WHERE
                id = :id AND
                last_authentication_event_global_position < :eventGlobalPosition
        `;

        return db.then((client) =>
            client.raw(rawQuery, {
                id: id,
                eventGlobalPosition: eventGlobalPosition,
            })
        );
    };

    const markRegistrationEmailSent = (id, eventGlobalPosition) => {
        return db.then((client) =>
            client('admin_users')
                .update({
                    registration_email_sent: true,
                    last_identity_event_global_position: eventGlobalPosition,
                })
                .where(
                    'last_identity_event_global_position',
                    '<',
                    eventGlobalPosition
                )
                .where({ id: id })
        );
    };

    const setEmail = (id, email, eventGlobalPosition) => {
        return db.then((client) =>
            client('admin_users')
                .update({
                    email: email,
                    last_identity_event_global_position: eventGlobalPosition,
                })
                .where(
                    'last_identity_event_global_position',
                    '<',
                    eventGlobalPosition
                )
                .where({ id: id })
        );
    };

    return {
        ensureUser,
        incrementLogin,
        markRegistrationEmailSent,
        setEmail,
    };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const identityHandlers = createIdentityHandlers({ queries });
    const identitySubscription = messageStore.createSubscription({
        streamName: 'identity',
        handlers: identityHandlers,
        subscriberId: 'aggregators:admin-identity',
    });

    const authenticationHandlers = createAuthenticationHandlers({ queries });
    const authenticationSubscription = messageStore.createSubscription({
        streamName: 'authentication',
        handlers: authenticationHandlers,
        subscriberId: 'aggregators:admin-authentication',
    });

    const start = () => {
        identitySubscription.start();
        authenticationSubscription.start();
    };

    return {
        authenticationHandlers,
        identityHandlers,
        queries,
        start,
    };
};

module.exports = build;
