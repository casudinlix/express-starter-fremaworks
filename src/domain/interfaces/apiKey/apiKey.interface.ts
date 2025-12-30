export interface IApiKey {
  id: string;
  user_id: string;
  name: string;
  key: string;
  is_active: boolean;
  expires_at?: Date;
  last_used_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IApiKeyCreate {
  user_id: string;
  name: string;
  key: string;
  expires_at?: Date;
}

export interface IApiKeyUpdate {
  name?: string;
  is_active?: boolean;
  expires_at?: Date;
}
