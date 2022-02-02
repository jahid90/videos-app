exports.up = (knex) => {
    return knex.schema.createTable('admin_subscriber_positions', (table) => {
        table.string('id').primary();
        table.integer('position').defaultsTo(0);
        table.integer('last_message_global_position').defaultsTo(0);
    });
};

exports.down = (knex) => knex.schema.dropTable('admin_subscriber_positions');
