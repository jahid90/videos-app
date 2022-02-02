exports.up = (knex) => {
    return knex.schema.alterTable('user_credentials', (table) => {
        table.string('role');
    });
};

exports.down = (knex) =>
    knex.schema.alterTable('user_credentials', (table) => {
        table.dropColumn('role');
    });
