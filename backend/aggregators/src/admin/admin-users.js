const env = require('../env');

const createHandlers = ({ queries }) => {
    return {
        Registered: (event) => {
            return queries
                .ensureUser(event.data.userId)
                .then(() =>
                    queries.setEmail(
                        event.data.userId,
                        event.data.email,
                        event.globalPosition
                    )
                );
        },
        RegistrationEmailSent: (event) => {
            return queries
                .ensureUser(event.data.userId)
                .then(() =>
                    queries.markRegistrationEmailSent(
                        event.data.userId,
                        event.globalPosition
                    )
                );
        },
        AdminPrivilegeAdded: (event) => {
            return queries.ensureUser(event.data.userId).then(() => {
                return queries.markUserAsAdmin(
                    event.data.userId,
                    event.globalPosition
                );
            });
        },
        AdminPrivilegeRemoved: (event) => {
            return queries
                .ensureUser(event.data.userId)
                .then(() =>
                    queries.unmarkUserAsAdmin(
                        event.data.userId,
                        event.globalPosition
                    )
                );
        },
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
                admin_users (id, is_admin)
            VALUES
                (:id, false)
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

        return db
            .then((client) =>
                client.raw(rawQuery, {
                    id: id,
                    eventGlobalPosition: eventGlobalPosition,
                })
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminUsersAgg-incrementLogin-${id}] skipping ${eventGlobalPosition}`
                    );
                }
            });
    };

    const markRegistrationEmailSent = (id, eventGlobalPosition) => {
        return db
            .then((client) =>
                client('admin_users')
                    .update({
                        registration_email_sent: true,
                        last_identity_event_global_position:
                            eventGlobalPosition,
                    })
                    .where(
                        'last_identity_event_global_position',
                        '<',
                        eventGlobalPosition
                    )
                    .where({ id: id })
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminUsersAgg-registrationEmailSent-${id}] skipping ${eventGlobalPosition}`
                    );
                }
            });
    };

    const setEmail = (id, email, eventGlobalPosition) => {
        return db
            .then((client) =>
                client('admin_users')
                    .update({
                        email: email,
                        last_identity_event_global_position:
                            eventGlobalPosition,
                    })
                    .where(
                        'last_identity_event_global_position',
                        '<',
                        eventGlobalPosition
                    )
                    .where({ id })
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminUsersAgg-setEmail-${id}] skipping ${eventGlobalPosition}`
                    );
                }
            });
    };

    const markUserAsAdmin = (id, eventGlobalPosition) => {
        return db
            .then((client) =>
                client('admin_users')
                    .update({
                        is_admin: true,
                        last_identity_event_global_position:
                            eventGlobalPosition,
                    })
                    .where({ id })
                    .where(
                        'last_identity_event_global_position',
                        '<',
                        eventGlobalPosition
                    )
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminUsersAgg-adminPrivilegeAdded-${id}] skipping ${eventGlobalPosition}`
                    );
                }
            });
    };

    const unmarkUserAsAdmin = (id, eventGlobalPosition) => {
        return db
            .then((client) =>
                client('admin_users')
                    .update({
                        is_admin: false,
                        last_identity_event_global_position:
                            eventGlobalPosition,
                    })
                    .where({ id })
                    .where(
                        'last_identity_event_global_position',
                        '<',
                        eventGlobalPosition
                    )
            )
            .then((changed) => {
                if (env.enableDebug && !changed) {
                    console.debug(
                        `[AdminUsersAgg-adminPrivilegeRemoved-${id}] skipping ${eventGlobalPosition}`
                    );
                }
            });
    };

    return {
        ensureUser,
        incrementLogin,
        markRegistrationEmailSent,
        setEmail,
        markUserAsAdmin,
        unmarkUserAsAdmin,
    };
};

const build = ({ db, messageStore }) => {
    const queries = createQueries({ db });
    const handlers = createHandlers({ queries });
    const subscription = messageStore.createSubscription({
        streamName: ['identity', 'authentication'],
        handlers,
        subscriberId: 'aggregators:admin-users',
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
