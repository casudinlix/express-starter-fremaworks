import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('name', 255);
    table.string('phone', 50);
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.timestamp('email_verified_at');
    table.timestamp('last_login_at');
    table.timestamps(true, true);
    table.timestamp('deleted_at');

    table.index('email');
    table.index('is_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
}
