import { UserRepository } from '../../domain/repositories/user/user.repository';
import { IPaginationParams } from '../../domain/interfaces/shared/pagination.interface';

export class UserService {
  private static repository = new UserRepository();

  /**
   * Get all users with advanced pagination
   * @example
   * UserService.findAll({
   *   page: 1,
   *   limit: 10,
   *   search: 'john',
   *   sortBy: 'email',
   *   sortOrder: 'asc',
   *   filters: { is_active: true }
   * })
   */
  static async findAll(params: IPaginationParams) {
    return await this.repository.findAllPaginated(params);
  }

  static async findById(id: string) {
    return await this.repository.findById(id);
  }
}
