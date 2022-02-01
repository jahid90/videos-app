exports.up = (knex) => {
    return knex.schema.createTable('admin_event_types', (table) => {
        table.string('type');
        table.string('stream_name');
        table.integer('message_count').defaultsTo(0);
        table.string('last_message_id');
        table.integer('last_message_global_position').defaultsTo(0);

        table.primary(['type', 'stream_name']);
    });
};

exports.down = (knex) => knex.schema.dropTable('admin_event_types');
