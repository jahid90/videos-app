exports.up = (knex) => {
    return knex.schema.createTable('user_credentials', (table) => {
        table.string('id').primary();
        table.string('email').notNullable();
        table.string('password_hash').notNullable();
        table.index('email');
    });
};

exports.down = (knex) => knex.schema.dropTable('user_credentials');
