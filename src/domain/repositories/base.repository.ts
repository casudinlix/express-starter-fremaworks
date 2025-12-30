import { Knex } from 'knex';
import { db } from '../../infrastructure/database/knex/knex';

export interface IPaginationOptions {
  page: number;
  limit: number;
  orderBy?: { column: string; order: 'asc' | 'desc' };
}

export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export abstract class BaseRepository<T> {
  protected tableName: string;
  protected primaryKey: string;

  constructor(tableName: string, primaryKey: string = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Get database instance
   */
  protected get db(): Knex {
    return db;
  }

  /**
   * Find one record by criteria
   */
  async findOne(criteria: Partial<T>): Promise<T | undefined> {
    return await this.db(this.tableName).where(criteria).first();
  }

  /**
   * Find all records by criteria
   */
  async findAll(criteria?: Partial<T>): Promise<T[]> {
    const query = this.db(this.tableName);
    if (criteria) {
      query.where(criteria);
    }
    return await query;
  }

  /**
   * Find by ID
   */
  async findById(id: string | number): Promise<T | undefined> {
    return await this.db(this.tableName)
      .where({ [this.primaryKey]: id })
      .first();
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const [row] = await this.db(this.tableName).insert(data).returning(this.primaryKey);

    // Handle both array of objects and array of values return types
    const id = typeof row === 'object' ? row[this.primaryKey] : row;

    const result = await this.findById(id);
    if (!result) throw new Error('Failed to create record');
    return result;
  }

  /**
   * Update record(s) by criteria
   */
  async update(criteria: Partial<T>, data: Partial<T>): Promise<number> {
    return await this.db(this.tableName)
      .where(criteria)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      });
  }

  /**
   * Update by ID
   */
  async updateById(id: string | number, data: Partial<T>): Promise<T | undefined> {
    await this.db(this.tableName)
      .where({ [this.primaryKey]: id })
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      });
    return await this.findById(id);
  }

  /**
   * Delete record(s) by criteria
   */
  async delete(criteria: Partial<T>): Promise<number> {
    return await this.db(this.tableName).where(criteria).del();
  }

  /**
   * Delete by ID
   */
  async deleteById(id: string | number): Promise<number> {
    return await this.db(this.tableName)
      .where({ [this.primaryKey]: id })
      .del();
  }

  /**
   * Soft delete (set deleted_at timestamp)
   */
  async softDelete(criteria: Partial<T>): Promise<number> {
    return await this.db(this.tableName).where(criteria).update({
      deleted_at: this.db.fn.now(),
    });
  }

  /**
   * Soft delete by ID
   */
  async softDeleteById(id: string | number): Promise<number> {
    return await this.softDelete({ [this.primaryKey]: id } as any);
  }

  /**
   * Count records
   */
  async count(criteria?: Partial<T>): Promise<number> {
    const query = this.db(this.tableName);
    if (criteria) {
      query.where(criteria);
    }
    const result = await query.count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  /**
   * Check if record exists
   */
  async exists(criteria: Partial<T>): Promise<boolean> {
    const count = await this.count(criteria);
    return count > 0;
  }

  /**
   * Paginate results
   */
  async paginate(
    options: IPaginationOptions,
    criteria?: Partial<T>
  ): Promise<IPaginationResult<T>> {
    const { page, limit, orderBy } = options;
    const offset = (page - 1) * limit;

    let query = this.db(this.tableName);
    if (criteria) {
      query = query.where(criteria);
    }

    const total = await this.count(criteria);

    if (orderBy) {
      query = query.orderBy(orderBy.column, orderBy.order);
    }

    const data = await query.limit(limit).offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Execute raw query
   */
  async raw<R = any>(query: string, bindings?: any[]): Promise<R> {
    const result = await this.db.raw(query, bindings || []);
    return result.rows || result[0];
  }

  /**
   * Begin transaction
   */
  async transaction<R>(callback: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return await this.db.transaction(callback);
  }

  /**
   * Bulk insert
   */
  async bulkInsert(data: Partial<T>[]): Promise<void> {
    await this.db(this.tableName).insert(data);
  }

  /**
   * Upsert (insert or update)
   */
  async upsert(data: Partial<T>, conflictColumns: string[]): Promise<void> {
    await this.db(this.tableName).insert(data).onConflict(conflictColumns).merge();
  }
}
