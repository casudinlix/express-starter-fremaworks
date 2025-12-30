import { BaseRepository } from '../base.repository';
import {
  IUser,
  IUserCreate,
  IUserUpdate,
  IUserWithRoles,
} from '../../interfaces/user/user.interface';
import {
  IPaginationParams,
  IPaginatedResponse,
} from '../../interfaces/shared/pagination.interface';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | undefined> {
    return await this.findOne({ email } as Partial<IUser>);
  }

  /**
   * Find active users
   */
  async findActive(): Promise<IUser[]> {
    return await this.findAll({ is_active: true } as Partial<IUser>);
  }

  /**
   * Create user
   */
  async createUser(data: IUserCreate): Promise<IUser> {
    return await this.create(data);
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: IUserUpdate): Promise<IUser | undefined> {
    return await this.updateById(id, data);
  }

  /**
   * Get user with roles and permissions
   */
  async findWithRolesAndPermissions(userId: string): Promise<IUserWithRoles | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    // Get user roles
    const roles = await this.db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .select('roles.slug');

    // Get user permissions through roles
    const permissions = await this.db('user_roles')
      .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('user_roles.user_id', userId)
      .distinct('permissions.slug')
      .select('permissions.slug');

    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      roles: roles.map((r) => r.slug),
      permissions: permissions.map((p) => p.slug),
    };
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.db('user_roles').insert({
      id: this.db.raw('gen_random_uuid()'),
      user_id: userId,
      role_id: roleId,
    });
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.db('user_roles').where({ user_id: userId, role_id: roleId }).del();
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const roles = await this.db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .select('roles.slug');

    return roles.map((r) => r.slug);
  }

  /**
   * Check if user has role
   */
  async hasRole(userId: string, roleSlug: string): Promise<boolean> {
    const role = await this.db('user_roles')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .where('user_roles.user_id', userId)
      .where('roles.slug', roleSlug)
      .first();

    return !!role;
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permissionSlug: string): Promise<boolean> {
    const permission = await this.db('user_roles')
      .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('user_roles.user_id', userId)
      .where('permissions.slug', permissionSlug)
      .first();

    return !!permission;
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.db(this.tableName)
      .where({ [this.primaryKey]: userId })
      .update({ last_login_at: this.db.fn.now() });
  }

  /**
   * Find all users with pagination, sorting, search, and filtering
   */
  async findAllPaginated(params: IPaginationParams): Promise<IPaginatedResponse<IUser>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filters,
    } = params;
    const offset = (page - 1) * limit;

    let query = this.db(this.tableName);

    // Apply Filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.where(key, value);
        }
      });
    }

    // Apply Search
    if (search) {
      query = query.where((builder) => {
        builder.where('name', 'ilike', `%${search}%`).orWhere('email', 'ilike', `%${search}%`);
      });
    }

    // Count Total (needed for pagination meta)
    const countQuery = query.clone();
    const totalResult = await countQuery.count('* as total').first();
    const total = parseInt(totalResult?.total as string) || 0;

    // Apply Sort and Pagination
    query = query.orderBy(sortBy, sortOrder).limit(limit).offset(offset);

    const data = await query;

    // Remove sensitive data
    const safeData = data.map((user) => {
      const { password, ...rest } = user;
      return rest as IUser;
    });

    return {
      data: safeData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
