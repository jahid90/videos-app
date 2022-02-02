exports.up = (knex) => {
    return knex.schema.createTable('creators_portal_videos', (table) => {
        table.string('id').primary();
        table.string('owner_id').notNullable();
        table.string('name');
        table.string('description');
        table.integer('views').defaultsTo(0);
        table.string('source_uri');
        table.string('transcoded_uri');
        table.integer('position').notNullable();
    });
};

exports.down = (knex) => knex.schema.dropTable('creators_portal_videos');
