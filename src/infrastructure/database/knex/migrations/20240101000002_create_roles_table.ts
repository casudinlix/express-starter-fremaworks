import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable().unique();
    table.string('slug', 100).notNullable().unique();
    table.text('description');
    table.timestamps(true, true);

    table.index('slug');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('roles');
}
