import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries
  await knex('api_keys').del();
  await knex('user_roles').del();
  await knex('users').del();

  // Get roles
  const superAdminRole = await knex('roles').where({ slug: 'super-admin' }).first();
  const adminRole = await knex('roles').where({ slug: 'admin' }).first();
  const userRole = await knex('roles').where({ slug: 'user' }).first();

  // Hash password
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Insert users
  const users = [
    {
      id: uuidv4(),
      email: 'superadmin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      phone: '+6281234567890',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
    {
      id: uuidv4(),
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+6281234567891',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
    {
      id: uuidv4(),
      email: 'manager@example.com',
      password: hashedPassword,
      name: 'Manager User',
      phone: '+6281234567892',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
    {
      id: uuidv4(),
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
      phone: '+6281234567893',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
    {
      id: uuidv4(),
      email: 'john.doe@example.com',
      password: hashedPassword,
      name: 'John Doe',
      phone: '+6281234567894',
      is_active: true,
      email_verified: false,
    },
    {
      id: uuidv4(),
      email: 'jane.smith@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      phone: '+6281234567895',
      is_active: true,
      email_verified: false,
    },
  ];

  await knex('users').insert(users);

  // Assign roles to users
  const userRoles = [
    { id: uuidv4(), user_id: users[0].id, role_id: superAdminRole.id },
    { id: uuidv4(), user_id: users[1].id, role_id: adminRole.id },
    {
      id: uuidv4(),
      user_id: users[2].id,
      role_id: await knex('roles')
        .where({ slug: 'manager' })
        .first()
        .then((r) => r.id),
    },
    { id: uuidv4(), user_id: users[3].id, role_id: userRole.id },
    { id: uuidv4(), user_id: users[4].id, role_id: userRole.id },
    { id: uuidv4(), user_id: users[5].id, role_id: userRole.id },
  ];

  await knex('user_roles').insert(userRoles);

  // Create sample API keys
  const apiKeys = [
    {
      id: uuidv4(),
      user_id: users[0].id,
      name: 'Super Admin API Key',
      key: 'sk_test_superadmin_' + Math.random().toString(36).substring(2, 15),
      is_active: true,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    {
      id: uuidv4(),
      user_id: users[1].id,
      name: 'Admin API Key',
      key: 'sk_test_admin_' + Math.random().toString(36).substring(2, 15),
      is_active: true,
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  ];

  await knex('api_keys').insert(apiKeys);
}
