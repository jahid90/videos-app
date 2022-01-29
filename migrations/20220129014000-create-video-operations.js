exports.up = (knex) => {
    return knex.schema.createTable('video_operations', (table) => {
        table.string('trace_id').primary();
        table.string('video_id').notNullable();
        table.bool('succeeded').notNullable();
        table.string('failure_reason');
    });
};

exports.down = (knex) => knex.schema.dropTable('video_operations');
