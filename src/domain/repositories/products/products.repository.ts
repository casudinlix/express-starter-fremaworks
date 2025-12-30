import { BaseRepository } from '../base.repository';
import { IProducts } from '../../interfaces/products/products.interface';

export class ProductsRepository extends BaseRepository<IProducts> {
  constructor() {
    super('productss'); // Assuming table name is plural
  }
}
