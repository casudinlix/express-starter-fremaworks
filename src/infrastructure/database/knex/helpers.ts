import { Knex } from 'knex';
import { db } from './knex';

/**
 * Global Database Helpers for Models
 * Reusable functions to simplify database operations
 */

export class DbHelpers {
  /**
   * Find one record by criteria
   */
  static async findOne<T>(table: string, criteria: Record<string, any>): Promise<T | undefined> {
    return await db(table).where(criteria).first();
  }

  /**
   * Find all records by criteria
   */
  static async findAll<T>(table: string, criteria?: Record<string, any>): Promise<T[]> {
    const query = db(table);
    if (criteria) {
      query.where(criteria);
    }
    return await query;
  }

  /**
   * Find by ID
   */
  static async findById<T>(table: string, id: string | number): Promise<T | undefined> {
    return await db(table).where({ id }).first();
  }

  /**
   * Create a new record
   */
  static async create<T>(table: string, data: Partial<T>): Promise<T | undefined> {
    const [id] = await db(table).insert(data).returning('id');
    if (!id) return undefined;
    return await this.findById<T>(table, id);
  }

  /**
   * Update record(s) by criteria
   */
  static async update<T>(
    table: string,
    criteria: Record<string, any>,
    data: Partial<T>
  ): Promise<number> {
    return await db(table)
      .where(criteria)
      .update({
        ...data,
        updated_at: db.fn.now(),
      });
  }

  /**
   * Update by ID
   */
  static async updateById<T>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T | undefined> {
    await db(table)
      .where({ id })
      .update({
        ...data,
        updated_at: db.fn.now(),
      });
    return await this.findById<T>(table, id);
  }

  /**
   * Delete record(s) by criteria
   */
  static async delete(table: string, criteria: Record<string, any>): Promise<number> {
    return await db(table).where(criteria).del();
  }

  /**
   * Delete by ID
   */
  static async deleteById(table: string, id: string | number): Promise<number> {
    return await db(table).where({ id }).del();
  }

  /**
   * Soft delete (set deleted_at timestamp)
   */
  static async softDelete(table: string, criteria: Record<string, any>): Promise<number> {
    return await db(table).where(criteria).update({
      deleted_at: db.fn.now(),
    });
  }

  /**
   * Soft delete by ID
   */
  static async softDeleteById(table: string, id: string | number): Promise<number> {
    return await this.softDelete(table, { id });
  }

  /**
   * Count records
   */
  static async count(table: string, criteria?: Record<string, any>): Promise<number> {
    const query = db(table);
    if (criteria) {
      query.where(criteria);
    }
    const result = await query.count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  /**
   * Check if record exists
   */
  static async exists(table: string, criteria: Record<string, any>): Promise<boolean> {
    const count = await this.count(table, criteria);
    return count > 0;
  }

  /**
   * Paginate results
   */
  static async paginate<T>(
    table: string,
    page: number = 1,
    limit: number = 10,
    criteria?: Record<string, any>,
    orderBy?: { column: string; order: 'asc' | 'desc' }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const offset = (page - 1) * limit;

    let query = db(table);
    if (criteria) {
      query = query.where(criteria);
    }

    const total = await this.count(table, criteria);

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
  static async raw<R = any>(query: string, bindings?: any[]): Promise<R> {
    const result = await db.raw(query, bindings || []);
    return result.rows || result[0];
  }

  /**
   * Begin transaction
   */
  static async transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return await db.transaction(callback);
  }

  /**
   * Bulk insert
   */
  static async bulkInsert<T>(table: string, data: Partial<T>[]): Promise<void> {
    await db(table).insert(data);
  }

  /**
   * Upsert (insert or update)
   */
  static async upsert<T>(
    table: string,
    data: Partial<T>,
    conflictColumns: string[]
  ): Promise<void> {
    await db(table).insert(data).onConflict(conflictColumns).merge();
  }

  /**
   * Find with relations (join)
   */
  static async findWithRelations<T>(
    table: string,
    relations: Array<{
      table: string;
      foreignKey: string;
      localKey: string;
      select?: string[];
    }>,
    criteria?: Record<string, any>
  ): Promise<T[]> {
    let query = db(table);

    relations.forEach((relation) => {
      query = query.leftJoin(
        relation.table,
        `${table}.${relation.localKey}`,
        `${relation.table}.${relation.foreignKey}`
      );

      if (relation.select) {
        query = query.select(relation.select.map((col) => `${relation.table}.${col}`));
      }
    });

    if (criteria) {
      query = query.where(criteria);
    }

    return await query;
  }
}

// Export individual helper functions for convenience
export const {
  findOne,
  findAll,
  findById,
  create,
  update,
  updateById,
  delete: deleteRecord,
  deleteById,
  softDelete,
  softDeleteById,
  count,
  exists,
  paginate,
  raw,
  transaction,
  bulkInsert,
  upsert,
  findWithRelations,
} = DbHelpers;
