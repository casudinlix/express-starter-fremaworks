import { BaseRepository } from '../base.repository';
import { IApiKey, IApiKeyCreate, IApiKeyUpdate } from '../../interfaces/apiKey/apiKey.interface';

export class ApiKeyRepository extends BaseRepository<IApiKey> {
  constructor() {
    super('api_keys');
  }

  /**
   * Find API key by key string
   */
  async findByKey(key: string): Promise<IApiKey | undefined> {
    return await this.findOne({ key } as Partial<IApiKey>);
  }

  /**
   * Find active API key by key string
   */
  async findActiveByKey(key: string): Promise<IApiKey | undefined> {
    return await this.db(this.tableName)
      .where({ key, is_active: true })
      .whereNull('deleted_at')
      .where(function (builder) {
        builder.whereNull('expires_at').orWhere('expires_at', '>', builder.client.raw('NOW()'));
      })
      .first();
  }

  /**
   * Find API keys by user ID
   */
  async findByUserId(userId: string): Promise<IApiKey[]> {
    return await this.findAll({ user_id: userId } as Partial<IApiKey>);
  }

  /**
   * Find active API keys by user ID
   */
  async findActiveByUserId(userId: string): Promise<IApiKey[]> {
    return await this.db(this.tableName)
      .where({ user_id: userId, is_active: true })
      .whereNull('deleted_at')
      .where(function (builder) {
        builder.whereNull('expires_at').orWhere('expires_at', '>', builder.client.raw('NOW()'));
      });
  }

  /**
   * Create API key
   */
  async createApiKey(data: IApiKeyCreate): Promise<IApiKey> {
    return await this.create(data);
  }

  /**
   * Update API key
   */
  async updateApiKey(id: string, data: IApiKeyUpdate): Promise<IApiKey | undefined> {
    return await this.updateById(id, data);
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(id: string): Promise<void> {
    await this.db(this.tableName).where({ id }).update({ last_used_at: this.db.fn.now() });
  }

  /**
   * Deactivate API key
   */
  async deactivate(id: string): Promise<void> {
    await this.updateById(id, { is_active: false } as Partial<IApiKey>);
  }

  /**
   * Activate API key
   */
  async activate(id: string): Promise<void> {
    await this.updateById(id, { is_active: true } as Partial<IApiKey>);
  }

  /**
   * Delete expired API keys
   */
  async deleteExpired(): Promise<number> {
    return await this.db(this.tableName).where('expires_at', '<', this.db.fn.now()).del();
  }
}
