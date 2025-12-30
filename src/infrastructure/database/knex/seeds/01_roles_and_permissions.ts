import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries
  await knex('role_permissions').del();
  await knex('user_roles').del();
  await knex('permissions').del();
  await knex('roles').del();

  // Insert roles
  const roles = [
    {
      id: uuidv4(),
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full system access with all permissions',
    },
    {
      id: uuidv4(),
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access with most permissions',
    },
    {
      id: uuidv4(),
      name: 'Manager',
      slug: 'manager',
      description: 'Management access with limited permissions',
    },
    {
      id: uuidv4(),
      name: 'User',
      slug: 'user',
      description: 'Standard user access',
    },
  ];

  await knex('roles').insert(roles);

  // Insert permissions
  const permissions = [
    // User permissions
    { id: uuidv4(), name: 'View Users', slug: 'users.view', resource: 'users', action: 'view' },
    {
      id: uuidv4(),
      name: 'Create Users',
      slug: 'users.create',
      resource: 'users',
      action: 'create',
    },
    { id: uuidv4(), name: 'Edit Users', slug: 'users.edit', resource: 'users', action: 'edit' },
    {
      id: uuidv4(),
      name: 'Delete Users',
      slug: 'users.delete',
      resource: 'users',
      action: 'delete',
    },

    // Role permissions
    { id: uuidv4(), name: 'View Roles', slug: 'roles.view', resource: 'roles', action: 'view' },
    {
      id: uuidv4(),
      name: 'Create Roles',
      slug: 'roles.create',
      resource: 'roles',
      action: 'create',
    },
    { id: uuidv4(), name: 'Edit Roles', slug: 'roles.edit', resource: 'roles', action: 'edit' },
    {
      id: uuidv4(),
      name: 'Delete Roles',
      slug: 'roles.delete',
      resource: 'roles',
      action: 'delete',
    },

    // Permission permissions
    {
      id: uuidv4(),
      name: 'View Permissions',
      slug: 'permissions.view',
      resource: 'permissions',
      action: 'view',
    },
    {
      id: uuidv4(),
      name: 'Assign Permissions',
      slug: 'permissions.assign',
      resource: 'permissions',
      action: 'assign',
    },

    // API Key permissions
    {
      id: uuidv4(),
      name: 'View API Keys',
      slug: 'api-keys.view',
      resource: 'api-keys',
      action: 'view',
    },
    {
      id: uuidv4(),
      name: 'Create API Keys',
      slug: 'api-keys.create',
      resource: 'api-keys',
      action: 'create',
    },
    {
      id: uuidv4(),
      name: 'Delete API Keys',
      slug: 'api-keys.delete',
      resource: 'api-keys',
      action: 'delete',
    },

    // Profile permissions
    {
      id: uuidv4(),
      name: 'View Own Profile',
      slug: 'profile.view',
      resource: 'profile',
      action: 'view',
    },
    {
      id: uuidv4(),
      name: 'Edit Own Profile',
      slug: 'profile.edit',
      resource: 'profile',
      action: 'edit',
    },
  ];

  await knex('permissions').insert(permissions);

  // Get role and permission IDs
  const superAdminRole = roles.find((r) => r.slug === 'super-admin')!;
  const adminRole = roles.find((r) => r.slug === 'admin')!;
  const managerRole = roles.find((r) => r.slug === 'manager')!;
  const userRole = roles.find((r) => r.slug === 'user')!;

  // Assign all permissions to super admin
  const superAdminPermissions = permissions.map((p) => ({
    id: uuidv4(),
    role_id: superAdminRole.id,
    permission_id: p.id,
  }));

  // Assign most permissions to admin (except role/permission management)
  const adminPermissions = permissions
    .filter((p) => !p.slug.startsWith('roles.') && !p.slug.startsWith('permissions.'))
    .map((p) => ({
      id: uuidv4(),
      role_id: adminRole.id,
      permission_id: p.id,
    }));

  // Assign limited permissions to manager
  const managerPermissions = permissions
    .filter(
      (p) =>
        p.slug.startsWith('users.view') ||
        p.slug.startsWith('profile.') ||
        p.slug.startsWith('api-keys.')
    )
    .map((p) => ({
      id: uuidv4(),
      role_id: managerRole.id,
      permission_id: p.id,
    }));

  // Assign basic permissions to user
  const userPermissions = permissions
    .filter((p) => p.slug.startsWith('profile.'))
    .map((p) => ({
      id: uuidv4(),
      role_id: userRole.id,
      permission_id: p.id,
    }));

  await knex('role_permissions').insert([
    ...superAdminPermissions,
    ...adminPermissions,
    ...managerPermissions,
    ...userPermissions,
  ]);
}
