import { BaseRepository } from '../base.repository';
import {
  IPermission,
  IPermissionCreate,
  IPermissionUpdate,
} from '../../interfaces/permission/permission.interface';

export class PermissionRepository extends BaseRepository<IPermission> {
  constructor() {
    super('permissions');
  }

  /**
   * Find permission by slug
   */
  async findBySlug(slug: string): Promise<IPermission | undefined> {
    return await this.findOne({ slug } as Partial<IPermission>);
  }

  /**
   * Find permissions by resource
   */
  async findByResource(resource: string): Promise<IPermission[]> {
    return await this.findAll({ resource } as Partial<IPermission>);
  }

  /**
   * Find permissions by action
   */
  async findByAction(action: string): Promise<IPermission[]> {
    return await this.findAll({ action } as Partial<IPermission>);
  }

  /**
   * Create permission
   */
  async createPermission(data: IPermissionCreate): Promise<IPermission> {
    return await this.create(data);
  }

  /**
   * Update permission
   */
  async updatePermission(id: string, data: IPermissionUpdate): Promise<IPermission | undefined> {
    return await this.updateById(id, data);
  }

  /**
   * Find permissions by resource and action
   */
  async findByResourceAndAction(
    resource: string,
    action: string
  ): Promise<IPermission | undefined> {
    return await this.findOne({ resource, action } as Partial<IPermission>);
  }
}
