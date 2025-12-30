import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../application/services/user.service';
import { ResponseFormatter } from '../../shared/utils/responseFormatter';

export class UserController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search, sortBy, sortOrder, is_active } = req.query as any;

      const filters: Record<string, string | number | boolean> = {};
      if (is_active !== undefined) {
        filters.is_active = is_active === 'true';
      }

      const data = await UserService.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder,
        filters,
      });

      ResponseFormatter.paginated(
        res,
        data.data,
        data.meta.page,
        data.meta.limit,
        data.meta.total,
        'Users retrieved successfully'
      );
    } catch (error) {
      return next(error);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.findById(id);

      if (!user) {
        return ResponseFormatter.error(res, 'User not found', 404);
      }

      // Remove sensitive data
      const { password, ...safeUser } = user;

      return ResponseFormatter.success(res, safeUser);
    } catch (error) {
      return next(error);
    }
  }
}
