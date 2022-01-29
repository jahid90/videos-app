exports.up = (knex) => {
    return knex.schema.createTable('admin_users', (table) => {
        table.string('id').primary();
        table.string('email');
        table.integer('last_identity_event_global_position').defaultTo(0);
        table.integer('login_count').defaultTo(0);
        table.integer('last_authentication_event_global_position').defaultTo(0);
        table.boolean('registration_email_sent').defaultTo(false);

        table.index('email');
    });
};

exports.down = (knex) => knex.schema.dropTable('admin_users');
