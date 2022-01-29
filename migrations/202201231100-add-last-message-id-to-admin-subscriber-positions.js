exports.up = (knex) => {
    return knex.schema.alterTable('admin_subscriber_positions', (table) => {
        table.string('last_message_id');
    });
};

exports.down = (knex) =>
    knex.schema.alterTable('admin_subscriber_positions', (table) => {
        table.dropColumn('last_message_id');
    });
