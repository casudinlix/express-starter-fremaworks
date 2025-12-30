import { BaseRepository } from '../base.repository';
import {
  IRole,
  IRoleCreate,
  IRoleUpdate,
  IRoleWithPermissions,
} from '../../interfaces/role/role.interface';

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super('roles');
  }

  /**
   * Find role by slug
   */
  async findBySlug(slug: string): Promise<IRole | undefined> {
    return await this.findOne({ slug } as Partial<IRole>);
  }

  /**
   * Create role
   */
  async createRole(data: IRoleCreate): Promise<IRole> {
    return await this.create(data);
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: IRoleUpdate): Promise<IRole | undefined> {
    return await this.updateById(id, data);
  }

  /**
   * Get role with permissions
   */
  async findWithPermissions(roleId: string): Promise<IRoleWithPermissions | null> {
    const role = await this.findById(roleId);
    if (!role) return null;

    const permissions = await this.db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', roleId)
      .select('permissions.slug');

    return {
      ...role,
      permissions: permissions.map((p) => p.slug),
    };
  }

  /**
   * Assign permission to role
   */
  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await this.db('role_permissions').insert({
      id: this.db.raw('gen_random_uuid()'),
      role_id: roleId,
      permission_id: permissionId,
    });
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await this.db('role_permissions').where({ role_id: roleId, permission_id: permissionId }).del();
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const permissions = await this.db('role_permissions')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('role_permissions.role_id', roleId)
      .select('permissions.slug');

    return permissions.map((p) => p.slug);
  }
}
