import { ProductsRepository } from '../../domain/repositories/products/products.repository';
import {
  IProductsCreate,
  IProductsUpdate,
} from '../../domain/interfaces/products/products.interface';
import { NotFoundError } from '../../shared/errors/AppError';

export class ProductsService {
  private static repository = new ProductsRepository();

  static async findAll() {
    return await this.repository.findAll();
  }

  static async findById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundError('Products not found');
    return item;
  }

  static async create(data: IProductsCreate) {
    return await this.repository.create(data);
  }

  static async update(id: string, data: IProductsUpdate) {
    const item = await this.findById(id);
    return await this.repository.updateById(item.id, data);
  }

  static async delete(id: string) {
    const item = await this.findById(id);
    return await this.repository.deleteById(item.id);
  }
}
