exports.up = (knex) => {
    return knex.schema.createTable('admin_categories', (table) => {
        table.string('category_name').primary();
        table.integer('message_count').defaultsTo(0);
        table.string('last_message_id');
        table.integer('last_message_global_position').defaultsTo(0);
    });
};

exports.down = (knex) => knex.schema.dropTable('admin_categories');
