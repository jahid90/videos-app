exports.up = (knex) => {
    return knex.schema.alterTable('admin_users', (table) => {
        table.bool('is_admin');
    });
};

exports.down = (knex) =>
    knex.schema.alterTable('admin_users', (table) => {
        table.dropColumn('is_admin');
    });
