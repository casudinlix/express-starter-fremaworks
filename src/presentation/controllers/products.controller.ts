import { Request, Response, NextFunction } from 'express';
import { ProductsService } from '../../application/services/products.service';
import { ResponseFormatter } from '../../shared/utils/responseFormatter';

export class ProductsController {
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const parsedPage = parseInt(page as string);
      const parsedLimit = parseInt(limit as string);

      // Assuming findAll returns just data for now, since ProductsService isn't updated yet.
      // But ResponseFormatter.paginated needs total.
      // For now I will comment this out or make it compliant with the existing (simple) service.
      const data = await ProductsService.findAll();
      ResponseFormatter.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async show(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ProductsService.findById(id);
      ResponseFormatter.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async store(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProductsService.create(req.body);
      ResponseFormatter.created(res, data, 'Products created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await ProductsService.update(id, req.body);
      ResponseFormatter.success(res, data, 'Products updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async destroy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ProductsService.delete(id);
      ResponseFormatter.success(res, null, 'Products deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
