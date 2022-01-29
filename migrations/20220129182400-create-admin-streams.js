exports.up = (knex) => {
    return knex.schema.createTable('admin_streams', (table) => {
        table.string('stream_name').primary();
        table.integer('message_count').defaultsTo(0);
        table.string('last_message_id');
        table.integer('last_message_global_position').defaultsTo(0);
    });
};

exports.down = (knex) => knex.schema.dropTable('admin_streams');
