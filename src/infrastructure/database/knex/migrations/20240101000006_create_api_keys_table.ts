import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('api_keys', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id');
    table.string('name', 255).notNullable();
    table.string('key', 255).notNullable().unique();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('expires_at');
    table.timestamp('last_used_at');
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    table.index('key');
    table.index('user_id');
    table.index('is_active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('api_keys');
}
